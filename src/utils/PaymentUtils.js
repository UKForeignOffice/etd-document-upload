'use strict'
var Global = require('../component/Global')

var decodeHexString = function (hexString) {
    return hexString.replace(/([0-9A-Fa-f]{2})/g, function () {
        return String.fromCharCode(parseInt(arguments[1], 16))
    })
}

var createSiginingString = function (signingData) {
    var keys = []
    var values = []
    for (var key in signingData) {
        if (signingData[key]) {
            keys.push(key)
            values.push(signingData[key])
        }
    }
    return keys.concat(values).join(":")
}

var hashData = function (data, hmacKey) {
        var crypto = require('crypto')
        return crypto.createHmac(Global.getConfig().server.payment.hashAlgorithm, decodeHexString(hmacKey))
            .update(data, 'utf-8')
            .digest('base64')
}


var isPaymentEnabledFor = function (post) {
    return (Global.getConfig().client.features.barclay && post.features.payment === 'Y')
}

module.exports = {
    decodeHexString,
    createSiginingString,
    hashData,
    isPaymentEnabledFor
}
