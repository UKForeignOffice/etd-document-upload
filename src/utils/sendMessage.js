'use strict';

var amqp = require('amqplib/callback_api')
var _ = require('lodash')
var Global = require('../component/Global')
var logger = require('../utils/logs/logger').getLogger('sendMessage')

function publisher(conn, message, brokerId) {
    conn.createChannel(function on_open(err, ch) {
        if (err != null) {
            logger.error("could not open message queue connection", err)
            return false
        }
        ch.publish(Global.getConfig().server.messageBrokers[brokerId].exchangeName, '', Buffer.from(JSON.stringify(message)), { persistent: true })
        logger.info("Message with guid ( %s ) sent to queue: %s",
            (_.get(message, 'putETDDetails.requestInfo.requestGUID')) ?  _.get(message, 'putETDDetails.requestInfo.requestGUID') : _.get(message, [_.keys(message)[0], 'guid']),
            Global.getConfig().server.messageBrokers[brokerId].queueName)

        return true
    })
    setTimeout(function() { conn.close() }, 10000)
}

var sendMessage = function (message, brokerId) {
    if (!Global.getConfig().server.messageBrokers[brokerId]) {
        logger.error('Message broker config not found: ', brokerId)
        return
    }

    logger.debug(`Sending AMQP message ${
        (_.get(message, 'putETDDetails.requestInfo.requestGUID')) ?  _.get(message, 'putETDDetails.requestInfo.requestGUID') : _.get(message, [_.keys(message)[0], 'guid'])
    } to ${brokerId} broker.`)

    if (!message) {
        logger.error("Empty message received!")
    } else {
        logger.debug(`Message content starts: ${JSON.stringify(message).substring(0, 100)}`)
    }
    amqp.connect(`amqp://${Global.getConfig().server.messageBrokers[brokerId].username}:${Global.getConfig().server.messageBrokers[brokerId].password}@${Global.getConfig().server.messageBrokers[brokerId].queueLocation}`, function (err, conn) {
        if (err != null) {
            logger.error("could not connect to message broker", err)
            return false
        }
        logger.debug("Connected to queue")
        return publisher(conn, message, brokerId)
    })
}

module.exports = sendMessage
