'use strict';

var Global = require('../component/Global')
var DataService = require('./DataService')
var logger = require('./logs/logger').getLogger('FeatureToggler')

var isBarclayEnabled = function (post) {
    var enabled = Global.getConfig().client.features.barclay && (post.features.payment === "Y")
    logger.info("FeatureToggler isBarclayEnabled: " + enabled)
    return enabled
}

var isBarclayEnabledByPostId = function (postId) {
    return DataService.getPosts(postId).then(
        function (post) {
            return isBarclayEnabled(post)
        }
    )
}

var isCasebookEnabled = function (post) {
    var enabled = Global.getConfig().client.features.casebook && (post.features.casebook === "Y")
    logger.info("FeatureToggler isCasebookEnabled: " + enabled)
    return enabled
}

var isCasebookEnabledByPostId = function (postId) {
    return DataService.getPosts(postId).then(
        function (post) {
            return isCasebookEnabled(post)
        }
    )
}

var isBookingbugEnabled = function (post) {
    var enabled = Global.getConfig().client.features.bookingbug && (post.features.bookingbug === "Y")
    logger.info("FeatureToggler isBookingbugEnabled: " + enabled)
    return enabled
}

var isBookingbugEnabledByPostId = function (postId) {
    return DataService.getPosts(postId).then(
        function (post) {
            return isBookingbugEnabled(post)
        }
    )
}

module.exports = {
    isBarclayEnabled, isBarclayEnabledByPostId,
    isCasebookEnabled, isCasebookEnabledByPostId,
    isBookingbugEnabled, isBookingbugEnabledByPostId
}
