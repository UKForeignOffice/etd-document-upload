'use strict'

// ====================
//
// TODO: Remove this file after 15th May 2018 (AEI-493)
// This RSA-based decryption is superseded by ./documentUploadLink.js.
// It should be removed from the codebase, along with relevant routing, config etc. at least 5 days after
// the release of CIS r.1.3, which will include the new AES-based encryption.
//
// ====================

// ====================
//
// TODO: Remove this file after 15th May 2018 (AEI-493)
// This RSA-based decryption is superseded by ./documentUploadLink.js.
// It should be removed from the codebase, along with relevant routing, config etc. at least 5 days after
// the release of CIS r.1.3, which will include the new AES-based encryption.
//
// ====================

var crypto = require('crypto')
var fs = require('fs')
var constants = require('constants')
var config = require('config')
var logger = require('./utils/logs/logger').getLogger('uploadLink')
var rs = require('./redis-session')
var Global = require('./component/Global')
var async = require('async')
var RestClient = require('./utils/RestClient')
var SuperagentHeadersPlugin = require('./component/SuperagentHeadersPlugin')
var _ = require('lodash')
var tasklistUtils = require('./utils/tasklistUtils')

var getUploadLink = function (uploadType, context) {
    logger.debug('Getting upload link for ' + uploadType)
    var uploadCategory = tasklistUtils.getTaskCategory(uploadType)
    switch (uploadCategory) {
        case 'photo':
            if (context === 'STAFF') {
                return '/photo-upload'
            }
            return '/photo-upload-about'
        case 'document':
            return '/document-upload'
        default:
            return '/generic-error'
    }
}

var uploadLink = function (request, response) {
    if (!request.params.hash) {
        logger.error("Invalid upload link")
        response.redirect('/tasks-link-error')
        return
    }
    var fullHash = decodeURI(request.params.hash)
    var hashPrefix = fullHash.substring(0, config.uploadLink.hashPrefixLength)
    var hashData = fullHash.substring(config.uploadLink.hashPrefixLength)
    var hash = Buffer.from(hashData, 'base64')
    var key = fs.readFileSync(config.uploadLink.keyFile, 'utf8')

    try {
        var options = {key: key, padding: constants.RSA_PKCS1_OAEP_PADDING}
        var dataString = crypto.privateDecrypt(options, hash)
        if (!dataString) {
            throw new Error("Could not decode data from link.")
        }
        var dataFromLink = JSON.parse(dataString)
        logger.info("Link data: " + JSON.stringify(dataFromLink))
        if (!dataFromLink) {
            throw new Error("Could not decode data from link - invalid JSON.")
        }

        if (hashPrefix !== dataFromLink.magicNumber) {
            throw new Error("Encoded magicNumber does not match magicNumber from link!")
        }

        if (!dataFromLink.expiryDateTime || new Date(dataFromLink.expiryDateTime) < new Date()) {
            throw new Error("The link that you are trying to use is no longer valid. Please request another one.")
        }
    } catch (e) {
        logger.error('Exception occurred decoding link: ', e.message)
        response.redirect('/tasks-link-error')
        return
    }

    // Check and update session based on link data
    async.waterfall([

            // delete existing session and create new one
            function (callback) {
                var params = {
                    app: config.server.redis.etdApplication.app,
                    id: Date.now(),
                    ttl: config.server.redis.etdApplication.ttl,
                    ip: request.ip,
                }

                rs.create(params,
                    _.partial(function (response, err, generatedToken) {
                        if (err) {
                            logger.error('Error creating redis session', err)
                            callback(err, dataFromLink)
                            return
                        }
                        if (Object.keys(generatedToken).length === 0 || !generatedToken.token) {
                            logger.error('missing-session')
                            callback(err, dataFromLink)
                            return
                        }
                        var data = _.extend(dataFromLink, generatedToken)
                        logger.info(JSON.stringify(data))
                        response.cookie('accessToken', data.token, {
                            secure: config.cookie.secure,
                            httpOnly: config.cookie.httpOnly
                        })
                        callback(null, data)
                    }, response)
                )
            },

            function (data, callback) {
                var uploadData = {
                    reference: data.reference,
                    context: data.context,
                    referenceType: data.system,
                    assetType: tasklistUtils.getTaskName(data.assetType),
                    fromLink: 'Y'
                }

                var otherTypeDescription = data.otherTypeDescription
                if (otherTypeDescription) {
                    logger.debug('Got other type description from upload link: ' + otherTypeDescription)
                    uploadData.otherTypeDescription = otherTypeDescription
                }

                if (!uploadData) {
                    logger.error("Unable generate data for UploadData store")
                    callback({type: 'uploadData'}, data)
                    return
                }

                RestClient()
                    .post(Global.getSessionApiBaseUrl(data.token) + '/form/UploadData')
                    .use(SuperagentHeadersPlugin)
                    .send(uploadData)
                    .end(function (err, res) {
                        if (err || res.serverError || res.clientError) {
                            callback({type: 'uploadData', error: err || res.body}, data)
                        }
                        else {
                            logger.debug("UploadData created", data)
                            callback(err, data)
                        }
                    })
            }
        ],

        function (err, data) {
            if (err) {
                logger.error("Error processing link", err.message)
                response.status(400).end("Invalid Link")
                return
            }

            if (!data || !data.assetType) {
                logger.error("Link does not contain valid data: ", data)
                response.status(400).end("Invalid Link")
                return
            }

            response.redirect(getUploadLink(tasklistUtils.getTaskName(data.assetType), data.context))
        })
}

module.exports = uploadLink
