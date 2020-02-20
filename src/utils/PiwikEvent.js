'use strict'

var Global = require('../component/Global')
var logger = require('./logs/logger').getLogger('PiwikEvent')
var env = require('./env')
var RestClient = require('./RestClient')

var fire = function (eventCategory, eventAction) {

    if (env.SERVER) {
        RestClient().get('https://'+Global.getConfig().client.piwik.url+'/piwik.php?idsite='+Global.getConfig().client.piwik.siteId+'&rec=1&e_c='+eventCategory+'&e_a='+eventAction).then(
            function (res) {
                logger.info("Event fired: "+ eventCategory + "->" +eventAction)
                return
            },
            function (err) {
                if (err.res && err.res.clientError) {
                    logger.error("Piwik event not sent "+err)
                    return
                }
            }
        )
    }
}

module.exports = {fire}
