'use strict'

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

var decrypt = function(cryptkey, iv, encryptdata) {
    var decipher = crypto.createDecipheriv('aes-128-cbc', cryptkey, iv)
    var decoded  = decipher.update(encryptdata, 'base64', 'utf8')
    decoded += decipher.final('utf8')
    return decoded
}

var uploadLink = function (request, response) {
    var encodedToken = ""
    if (request.params.hash) {
        encodedToken = request.params.hash
    } else if (request.query.token) {
        encodedToken = request.query.token
    } else {
        logger.error("Invalid upload link")
        response.redirect('/tasks-link-error')
        return
    }
    var fullLinkToken = decodeURI(encodedToken)
    var linkPrefix = fullLinkToken.substring(0, config.server.uploadLink.hashPrefixLength)
    var combinedHash = fullLinkToken.substring(config.server.uploadLink.hashPrefixLength)
    var initVectorLength = 16
    var key = config.server.uploadLink.sharedKey

    try {
        var utf8Hash = new Buffer(combinedHash, 'base64')
        var iv = Buffer.allocUnsafe(initVectorLength)
        utf8Hash.copy(iv)
        var base64Hash = Buffer.allocUnsafe(utf8Hash.length - initVectorLength)
        utf8Hash.copy(base64Hash, 0, initVectorLength)
        var linkDataJson = decrypt(key, iv, base64Hash)
        if (!linkDataJson) {
            throw new Error("Could not decode data from link.")
        }
        var dataFromLink = JSON.parse(linkDataJson)

        if (!dataFromLink) {
            throw new Error("Could not decode data from link - invalid JSON.")
        }

        if (linkPrefix !== dataFromLink.m) {
            throw new Error("Encoded magicNumber does not match magicNumber from link!")
        }

        if (!dataFromLink.e || new Date(dataFromLink.e) < new Date()) {
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
                    reference: data.r,
                    context: data.c,
                    referenceType: data.s,
                    assetType: tasklistUtils.getTaskName(data.t),
                    fromLink: 'Y'
                }

                var otherTypeDescription = data.o
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

            if (!data || !data.t) {
                logger.error("Link does not contain valid data: ", data)
                response.status(400).end("Invalid Link")
                return
            }

            response.redirect(getUploadLink(tasklistUtils.getTaskName(data.t), data.c))
        })
}

module.exports = uploadLink
