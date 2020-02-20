'use strict'

var async = require('async')
var _ = require('lodash')
var moment = require('moment')
var rs = require('./redis-session')
var config = require('config')
var logger = require('./utils/logs/logger').getLogger('tasklistApi')
var IsomorphicFormDataHolder = require("./component/IsomorphicFormDataHolder")

var forms = require('./forms')

// Ensure only certain forms can be stored in the tasklist data store
var tasklistSections = [
    'TaskListInfoForm',
    'TaskListTaskForm'
]

var createTasklist = function (req, res) {

    var ttl = config.server.redis.tasklist.ttl
    if (typeof(ttl) === 'undefined') {
        res.status(500).send({error: 'missing config param ttl'})
        return
    }
    logger.debug('Tasklist session TTL: ' + ttl)

    var appName = config.server.redis.tasklist.app
    if (typeof(appName) === 'undefined') {
        res.status(500).send({error: 'missing config param appName'})
        return
    }
    logger.debug('Tasklist session app name: ' + appName)

    var ref = req.body.ref
    if (typeof(ref) === 'undefined') {
        res.status(400).send({error: 'missing body ref'})
        return
    }
    logger.debug('New session ref: ' + ref)

    var params = {
        app: appName,
        id: ref,
        ttl: ttl,
        ip: '127.0.0.1'
    }
    logger.debug('Session params: ' + JSON.stringify(params))

    rs.create(params,
        _.partial(function (res, err, resp) {

            if (err) {
                logger.error('Unable to create redis session for ref: ' + ref + ' error: ' + err)
                res.status(500).send(err)
                return
            }
            if (Object.keys(resp).length === 0) {
                logger.error('missing-session for ref: ' + ref)
                res.status(404).send({error: 'missing-session'})
                return
            }
            logger.info('New tasklist session created for ref: ' + ref + ' params: ' + JSON.stringify(params))
            res.send(resp)
        }, res)
    )
}

var deleteTasklist = function (req, res) {

    var token = req.params.tasklistToken

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.status(400).send({error: 'missing param token'})
        return
    }

    var params = {
        app: config.server.redis.tasklist.app,
        token: token,

    }

    rs.kill(params,
        _.partial(function (res, err, resp) {
            if (err) {
                res.status(500).send(err)
                return
            }
            if (resp.kill === 0) {
                res.status(404).send({error: 'session-not-found'})
                return
            }
            res.send('ok')
        }, res)
    )
}


var updateTasklist = function (req, res) {

    var token = req.params.tasklistToken
    var formName = req.params.formName
    logger.debug("formName: " + formName)

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.status(400).send({error: 'missing-token'})
        return
    }

    if (typeof(formName) === 'undefined') {
        logger.error('missing param formName')
        res.status(400).send({error: 'missing param formName'})
        return
    }

    if (tasklistSections.indexOf(formName) === -1) {
        logger.error('invalid formName')
        res.status(400).send({error: 'invalid param formName'})
        return
    }

    if (!_.keys(req.body).length) {
        res.status(400).send({error: 'missing-data'})
        return
    }

    async.waterfall([
            function (callback) {
                rs.get({
                    app: config.server.redis.tasklist.app,
                    token: token
                }, _.partial(function (res, err, resp) {
                    if (err) {
                        logger.error('err', err)
                        callback({status: 500, message: err}, null)
                        return
                    }
                    if (Object.keys(resp).length === 0) {
                        logger.error('missing-session')
                        callback({status: 404, message: 'missing-session'}, null)
                        return
                    }
                    var sessionDataTransformed = _.mapValues(resp.d, function (value, key) {
                        return JSON.parse(value)
                    })
                    callback(null, sessionDataTransformed)
                }, res))
            },
            function (data, callback) {
                var formData = new IsomorphicFormDataHolder(data)
                var form = new forms[formName]({
                    data: req.body,
                    sessionData: formData.getSessionData(),
                    auxiliaryData: formData.getAuxiliaryData()
                })
                form.validate(function (err, isValid) {
                    if (err) {
                        logger.error(err)
                        callback({status: 500, message: err}, null)
                        return
                    }
                    if (
                        !isValid
                    ) {
                        logger.error('form is not valid -> ' + JSON.stringify(form.errors()))
                        callback({status: 400, json: form.errors()}, null)
                        return
                    }

                    var transformedData = _.mapValues(form.cleanedData, function (value) {
                        if (value instanceof Date) {
                            return moment(value).format('DD-MM-YYYY')
                        }
                        else {
                            return value
                        }
                    })

                    callback(null, formName, transformedData)
                })
            },
            function (formName, formData, callback) {
                var formDataJSON = {}

                var sectionKey = (formName === 'TaskListTaskForm') ? formData.taskName : formName
                formDataJSON[sectionKey] = JSON.stringify(formData)
                callback(null, formDataJSON)
            }
        ],

        function (err, formDataJSON) {
            logger.debug("Updating tasklist data: " + JSON.stringify(formDataJSON))
            if (err) {
                switch (err.status) {
                    case 400:
                        res.status(400).send({error: err.json})
                        break
                    default:
                        res.status(500).send({error: err.json})
                }
                return
            }

            rs.set({
                    app: config.server.redis.tasklist.app,
                    token: token,
                    d: formDataJSON
                },
                _.partial(function (res, err, resp) {

                        if (err) {
                            logger.error('err', err)
                            res.status(500).send(err)
                            return
                        }

                        if (Object.keys(resp).length === 0) {
                            logger.error('missing-session')
                            res.status(404).send({error: 'missing-session'})
                            return
                        }
                        res.send('ok')
                    },
                    res
                )
            )
        })
}

var getTasklist = function (req, res) {
    var token = req.params.tasklistToken

    if (typeof(token) === 'undefined') {
        res.send({error: 'missing param token'}, 400)
        return
    }

    rs.get({
        app: config.server.redis.tasklist.app,
        token: token
    }, _.partial(function (res, err, resp) {
        if (err) {
            logger.error('err', err)
            res.status(500).send(err)
            return
        }
        if (Object.keys(resp).length === 0) {
            logger.error('missing-session')
            res.status(404).send({error: 'missing-session'})
            return
        }
        var sessionDataTransformed = _.mapValues(resp.d, function (value, key) {
            return JSON.parse(value)
        })

        res.json(sessionDataTransformed)
    }, res))
}

var getTasklistTokenFromRef = function (req, res) {

    logger.info('Getting tasklist info for ref: ' + JSON.stringify(req.params.hash))
    var hash = req.params.hash

    async.waterfall([
            function (callback) {
                rs.soid({
                        app: config.server.redis.tasklist.app,
                        id: hash
                    },
                    _.partial(function (res, err, resp) {
                            if (err) {
                                callback(err, null)
                                return
                            }
                            if (Object.keys(resp).length === 0) {
                                callback(new Error('missing-session'), null)
                                return
                            }

                            if (resp.sessions && resp.sessions.length === 0) {
                                callback(new Error('session-not-found'), null)
                                return
                            }
                            callback(null, resp.sessions[0])
                        },
                        res
                    )
                )
            },
            function (data, callback) {
                var params = {
                    app: config.server.redis.tasklist.app,
                    id: data.id,
                }
                rs.killsoid(params, function (err, resp) {
                    if (err) {
                        callback(err, null)
                        return
                    }
                    callback(null, data)
                })
            },
            // Cannot revive sessions without the token, so create new session from previous data and kill current one
            function (data, callback) {
                var params = {
                    app: config.server.redis.tasklist.app,
                    id: data.id,
                    ttl: config.server.redis.tasklist.ttl,
                    ip: '127.0.0.1',
                    d: data.d
                }

                rs.create(params,
                    _.partial(function (res, err, resp) {
                            if (err) {
                                callback(err, null)
                                return
                            }
                            if (Object.keys(resp).length === 0) {
                                callback(new Error('missing-session'), null)
                                return
                            }
                            callback(null, resp)
                        },
                        res
                    )
                )
            }
        ],
        function (err, data) {
            if (err) {
                logger.error(err)
                res.status(400).send({'error': err.message})
                return
            }
            res.send(data)
        })
}
module.exports = {
    createTasklist: createTasklist,
    deleteTasklist: deleteTasklist,
    updateTasklist: updateTasklist,
    getTasklistTokenFromRef: getTasklistTokenFromRef,
    getTasklist: getTasklist
}
