'use strict';

var RedisSessions = require('ioredis-sessions')
var config = require('config')

var rs = new RedisSessions({
    sentinels: config.server.redis.sentinels,
    name: config.server.redis.sentinelMasterName,
    password: config.server.redis.auth
})

module.exports = rs