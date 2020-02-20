'use strict';

var _ = require('lodash')
var async = require('async')
var config = require('config')
var Global = require('./component/Global')
var logger = require('./utils/logs/logger').getLogger('uploadLink')
var RestClient = require('./utils/RestClient')
var rs = require('./redis-session')
var SuperagentHeadersPlugin = require('./component/SuperagentHeadersPlugin')
var tasklistCrypto = require('./utils/tasklistCrypto')

var tasklistLink = function (request, response) {
    async.waterfall([
        // Decrypt the hashed reference
        function (callback) {
            var hashedReference = decodeURI(request.params.hash)
            if (!hashedReference) {
                logger.error('Tasklist link called with no hashed reference.')
                callback({error: 'Invalid link'}, null)
                return
            }
            var etdReference
            try {
                etdReference = tasklistCrypto.decryptReference(hashedReference)
                if (!etdReference) {
                    logger.error('Hashed reference could not be decrypted.')
                    callback({error: 'Invalid link'}, null)
                    return
                }
                logger.debug(`Got ETD ref: ${etdReference}`)
                var uploadData = {
                    reference: etdReference,
                    referenceType: 'ETDONLINE',
                    context: 'PUBLIC'
                }
                callback(null, {UploadData: uploadData})
            } catch (e) {
                logger.error('Exception occurred decoding link: ', e.message)
                callback({error: 'Invalid link'}, null)
            }
        },
        // Find the existing in-progress tasklist session
        function (data, callback) {
            var findTaskListUrl = Global.getTasklistApiBaseUrl() + '/find/' + data.UploadData.reference
            RestClient()
                .get(findTaskListUrl)
                .use(SuperagentHeadersPlugin)
                .end((err, res) => {
                    if (err || res.serverError || res.clientError || res.body.error) {
                        logger.error('Unable to retrieve existing tasklist session ID for ref: ' + data.UploadData.reference)
                        callback({error: 'No existing tasklist data found.'}, null)
                    }
                    else {
                        var tasklistId = res.body.token
                        var etdReference = data.UploadData.reference
                        logger.debug(`Found existing tasklist: ${tasklistId} for ref: ${etdReference}`)
                        data.UploadData.tasklistReference = tasklistId
                        callback(null, data)
                    }
                })
        },
        // delete existing session and create new one
        function (data, callback) {
            var params = {
                app: config.server.redis.etdApplication.app,
                id: Date.now(),
                ttl: config.server.redis.etdApplication.ttl,
                ip: request.ip,
            }
            rs.create(params,
                _.partial((response, err, generatedToken) => {
                    if (err) {
                        logger.error('Error creating redis session: ', err)
                        callback({error: err}, null)
                        return
                    }
                    if (Object.keys(generatedToken).length === 0 || !generatedToken.token) {
                        logger.error('Error creating redis session: no token generated.')
                        callback({error: 'Unable to generate session.'}, null)
                        return
                    }
                    var sessionData = _.extend(data, generatedToken)
                    logger.debug('Created session: ' + JSON.stringify(sessionData))
                    response.cookie('accessToken', sessionData.token, {
                        secure: config.cookie.secure,
                        httpOnly: config.cookie.httpOnly
                    })
                    callback(null, sessionData)
                }, response)
            )
        },
        // Get additional tasklist session data and check the expiryDateTime
        function (data, callback) {
            var getTaskListUrl = Global.getTasklistApiBaseUrl() + "/" + data.UploadData.tasklistReference
            RestClient()
                .get(getTaskListUrl)
                .use(SuperagentHeadersPlugin)
                .end((err, res) => {
                    if (err || res.serverError || res.clientError || res.body.error) {
                        logger.error('Unable to retrieve existing tasklist data.')
                        callback({error: 'Existing tasklist data not readable.'}, null)
                    }
                    else {
                        // @todo should TaskListInfoForm always be available at this point?
                        logger.debug('Retrieved tasklist data: ' + JSON.stringify(res.body))
                        var tasklistExpiryDateTime = _.get(res.body, 'TaskListInfoForm.expiryDateTime')
                        if (!tasklistExpiryDateTime) {
                            logger.warn('Unable to access tasklist from link - no expiry time exists.')
                            callback({error: 'Tasklist expiry time does not exist.'}, data)
                        }
                       else if(new Date() > new Date(tasklistExpiryDateTime.toString()))
                        {
                            logger.warn(`Unable to access tasklist from link - tasklist has expired (expiry date ${tasklistExpiryDateTime}).`)
                            callback({error: 'Tasklist has expired.'}, data)
                        }
                       else {
                            logger.debug(`Tasklist is within expiry time. Deadline is  ${tasklistExpiryDateTime}.`)
                            data.UploadData['firstName'] = _.get(res.body, 'TaskListInfoForm.firstName')
                            data.UploadData['paymentProviderUkPay'] = _.get(res.body, 'TaskListInfoForm.paymentProviderUkPay')
                            data.UploadData['postLabel'] = _.get(res.body, 'TaskListInfoForm.postLabel')
                            data.UploadData['currentCountry'] = _.get(res.body, 'TaskListInfoForm.currentCountry')
                            data.UploadData['courierPrice'] = _.get(res.body, 'TaskListInfoForm.courierPrice')
                            callback(null, data)
                        }
                    }
                })
        },
        // Push UploadData data to new session
        function (data, callback) {
            RestClient()
                .post(Global.getSessionApiBaseUrl(data.token) + '/form/UploadData')
                .use(SuperagentHeadersPlugin)
                .send(data.UploadData)
                .end((err, res) => {
                    if (err || res.serverError || res.clientError) {
                        callback({error: 'Unable to populate session with initial data.'}, null)
                    }
                    else {
                        logger.debug('Session initialised with UploadData.', JSON.stringify(data))
                        callback(err, data)
                    }
                })
        }
    ],
    function (err, data) {
        if (err) {
            if (err.error === 'Tasklist has expired.') {
                    logger.error(`Error processing link: "${err.error}". Redirecting to link expired page.`, err.error)
                    response.redirect('/tasks-link-expired')
            } else {
                logger.error(`Error processing link: "${err.error}". Redirecting to general task list error page.`, err.error)
                response.redirect('/tasks-link-error')
                return
            }
        }
        if (!data) {
            logger.error(`Error processing link: session data not generated. Redirecting to general task list error page.`, err.error)
            response.redirect('/tasks-link-error')
            return
        }
        response.redirect('/task-list')
    })
}

module.exports = tasklistLink
