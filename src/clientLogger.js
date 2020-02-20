'use strict';

var logger = require('./utils/logs/logger').getLogger('clientLogger')

function log(level, message) {
    if (level <= 1000) {
        return logger.debug(message)
    }
    if (level <= 2000) {
        return logger.debug(message)
    }
    if (level <= 3000) {
        return logger.info(message)
    }
    if (level <= 4000) {
        return logger.warn(message)
    }
    if (level <= 5000) {
        return logger.error(message)
    }
    return logger.error(message)
}

/**
 * Attempts to deserialize the passed in string as a JSON object.
 * If this fails somehow, returns the string itself.
 * Otherwise, returns the deserialized object.
 */
var safeDeserialise = function (s) {
    try {
        return JSON.parse(s);
    } catch (e) {
        return s;
    }
};

var clientLogger = function (request, response) {

    if (!request.body) {
        return response.send()
    }

    var logJson = request.body
    var nbrLogEntries = logJson.lg.length;
    var i = 0;

    for (i = 0; i < nbrLogEntries; i++) {
        var receivedLogEntry = logJson.lg[i];
        var loggerName = receivedLogEntry.n;
        var logLevel = receivedLogEntry.l;

        // Build object to log through the server side jsnlog.
        var newLogEngry = {

            clientTimestamp: new Date(receivedLogEntry.t),
            loggerName: loggerName,
            // If on the client an object was logged, that will now live in the
            // logEntry as a JSON string.
            clientMessage: safeDeserialise(receivedLogEntry.m)
        };

        log(logLevel, newLogEngry);
    }
    response.send()
}

module.exports = clientLogger
