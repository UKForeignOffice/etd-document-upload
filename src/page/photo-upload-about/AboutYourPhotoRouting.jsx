'use strict'

var RestClient = require('../../utils/RestClient')
var Global = require('../../component/Global')
var env = require('../../utils/env')

var logger = require('../../utils/logs/logger').getLogger('AboutYourPhotoRouting')

var AboutYourPhotoRouting = function (transition, params, query, req) {
    switch (req.body.howSupplyingPhoto) {
        case 'Y':
            return offlinePhotoSend(req)
        case 'N':
            return 'photo-upload'
        default:
            return 'photo-upload'
    }
}

var offlinePhotoSend = function (req) {
    function injectSessionId(request) {
        if (env.SERVER || Global.getConfig().client.injectSessionIdInURL) {
            return request.query({token: Global.getAccessToken(req.token)})
        }
        return request
    }

    return injectSessionId(RestClient().post(Global.getBaseUrl() + '/photoSend'))
        .then(
            function (res) {
                if (res.text === 'ok') {
                    return 'task-list'
                } else {
                    logger.error('Photo offline send failed returning non-ok response: ' + res.text)
                    return 'generic-error'
                }
            },
            function (err) {
                logger.error('Photo confirm routing failed: ' + err)
                return 'generic-error'
            })
}

module.exports = AboutYourPhotoRouting

