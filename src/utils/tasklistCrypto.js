'use strict';

var config = require('config')
var crypto = require('crypto')
var logger = require('./logs/logger').getLogger('tasklistCrypto')

var encryptReference = function(etdOnlineRef) {
    var key = config.server.tasklistUrl.key
    var inputEncoding = config.server.tasklistUrl.inputEncoding
    var outputEncoding = config.server.tasklistUrl.outputEncoding
    var algorithm = config.server.tasklistUrl.algorithm

    logger.debug('Encrypting "%s" using %s.', etdOnlineRef, algorithm)
    var cipher = crypto.createCipher(algorithm, key)
    var encrypted = cipher.update(etdOnlineRef, inputEncoding, outputEncoding)
    encrypted += cipher.final(outputEncoding)
    logger.debug('Result in %s is "%s".', outputEncoding, encrypted)

    return encrypted
}

var decryptReference = function(hashedReference) {
    var key = config.server.tasklistUrl.key
    var inputEncoding = config.server.tasklistUrl.inputEncoding
    var outputEncoding = config.server.tasklistUrl.outputEncoding
    var algorithm = config.server.tasklistUrl.algorithm

    logger.debug('Decrypting "%s" using %s.', hashedReference, algorithm)
    var decipher = crypto.createDecipher(algorithm, key)
    var decryptedRef = decipher.update(hashedReference, outputEncoding, inputEncoding)
    decryptedRef += decipher.final(inputEncoding)
    logger.debug('Result in %s is "%s".', inputEncoding, decryptedRef)

    return decryptedRef
}

module.exports = {
    encryptReference,
    decryptReference
}
