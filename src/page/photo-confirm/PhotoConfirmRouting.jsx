'use strict'
var RestClient = require('../../utils/RestClient')
var logger = require('../../utils/logs/logger').getLogger('photoConfirmRouting')
var Global = require('../../component/Global')
var env = require('../../utils/env')

var PhotoConfirmRouting = function (transition, params, query, req) {
    function injectSessionId(request) {
        if (env.SERVER || Global.getConfig().client.injectSessionIdInURL) {
            return request.query({token: Global.getAccessToken(req.token)})
        }
        return request
    }

    return injectSessionId(RestClient().post(Global.getBaseUrl() + '/photoConfirm'))
        .then(
            function (res) {
                if (res.text === 'ok') {
                    return RestClient().get(Global.getSessionApiBaseUrl(req.token) + '/form').then(
                        function (res) {
                            if (res.body.UploadData.fromLink !== 'Y') {
                                logger.info("fromlink1: |" + res.body.UploadData.fromLink + "|")
                                return 'task-list'
                            } else {
                                logger.info("fromlink2: |" + res.body.UploadData.fromLink + "|")
                                return 'photo-success'
                            }
                        },
                        function (err) {
                            logger.error('Photo confirm upload data routing failed: ' + err)
                            return 'generic-error'
                        }
                    )
                } else {
                    return 'photo-confirm?error=cannot-submit'
                }
            },
            function (err) {
                logger.error('Photo confirm routing failed: ' + err)
                return 'generic-error'
            })
}

module.exports = PhotoConfirmRouting

