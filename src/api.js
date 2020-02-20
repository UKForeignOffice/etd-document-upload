'use strict';

var async = require('async')
var _ = require('lodash')
var moment = require('moment')
var rs = require('./redis-session')
var config = require('config')
var urlUtility = require('url')
var logger = require('./utils/logs/logger').getLogger('api')
var IsomorphicFormDataHolder = require("./component/IsomorphicFormDataHolder")

var forms = require('./forms')

var createSession = function (req, res) {

    var ttl = req.query.ttl
    var ip = req.query.ip

    if (typeof(ttl) === 'undefined') {
        res.status(400).send({error: 'missing param ttl'})
        return
    }

    if (typeof(ip) === 'undefined') {
        res.status(400).send({error: 'missing param ip'})
        return
    }

    var params = {
        app: config.server.redis.etdApplication.app,
        id: Date.now(),
        ttl: ttl,
        ip: ip
    }

    if (_.keys(req.body).length) {
        params = _.extend(params, {
            d: req.body
        });
    }

    rs.create(params,
        _.partial((res, err, resp) => {

            if (err) {
                res.status(500).send(err)
                return
            }
            if (Object.keys(resp).length === 0) {
                logger.error('missing-session')
                res.status(404).send({error: 'missing-session'})
                return
            }

            res.send(resp)
        }, res)
    )
}

var deleteSession = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.status(400).send({error: 'missing param token'})
        return
    }

    var params = {
        app: config.server.redis.etdApplication.app,
        token: token,

    }

    rs.kill(params,
        _.partial((res, err, resp) => {
            if (err) {
                res.status(500).send(err)
                return
            }
            if (resp.kill === 0) {
                res.status(400).send({error: 'session-not-found'})
                return
            }
            res.send('ok')
        }, res)
    )
}

var postSessionForm = function (req, res) {
    var formName = req.params.formName
    var token = req.params.token

    if (typeof(formName) === 'undefined') {
        logger.error('missing param formName')
        res.status(400).send({error: 'missing param formName'})
        return
    }

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.status(400).send({error: 'missing param token'})
        return
    }

    if (typeof forms[formName] === 'undefined') {
        logger.error(`Invalid form name: ${formName}`)
        res.status(400).send({error: `Invalid form name: ${formName}`})
        return
    }

    async.waterfall([
            function (callback) {
                rs.get({
                    app: config.server.redis.etdApplication.app,
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
            function (sessionData, callback) {
                var fetchAuxiliaryData = forms[formName].FetchAuxiliaryData
                var data = new IsomorphicFormDataHolder()
                    .setFormName(formName)
                    .setSessionData(sessionData)
                    .getData()

                if (typeof fetchAuxiliaryData === 'function') {
                    fetchAuxiliaryData({'token': token}, data, callback)
                } else {
                    callback(null, data)
                }
            },
            function (data, callback) {
                var formData = new IsomorphicFormDataHolder(data)
                var form = new forms[formName]({
                    data: req.body,
                    sessionData: formData.getSessionData(),
                    auxiliaryData: formData.getAuxiliaryData()
                })
                form.validate((err, isValid) => {
                    if (err) {
                        logger.error(err)
                        callback({status: 500, message: err}, null)
                    }
                    if (!isValid) {
                        logger.error('form is not valid -> ' + JSON.stringify(form.errors()))
                        callback({status: 400, json: form.errors()}, null)
                    }

                    var transformedData = _.mapValues(form.cleanedData, function (value) {
                        if (value instanceof Date) {
                            return moment(value).format('DD-MM-YYYY')
                        }
                        else {
                            return value
                        }
                    })

                    callback(null, formName, transformedData);
                })
            },
            function (formName, formData, callback) {
                var formDataJSON = {}
                formDataJSON[formName] = JSON.stringify(formData)
                callback(null, formDataJSON)
            }
        ],

        function (err, formDataJSON) {

            if (err) {
                switch (err.status) {
                    case 400:
                        res.status(400).send({error: err.json})
                        break
                    case 404:
                        res.status(404).send({error: err.message})
                        break
                    default:
                        res.status(500).send({error: err.json})
                }
                return
            }

            rs.set({
                    app: config.server.redis.etdApplication.app,
                    token: token,
                    d: formDataJSON
                },
                _.partial((res, err, resp) => {

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
                }, res)
            )
        })
}

var pdfStashedData = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        logger.error('missing param token')
        res.status(400).send({error: 'missing param token'})
        return
    }

    async.waterfall([
            function (callback) {
                rs.get({
                    app: config.server.redis.etdApplication.app,
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

                var form = {
                    data: req.body,
                }

                var transformedData = _.mapValues(form, function (value) {
                    if (value instanceof Date) {
                        return moment(value).format('DD-MM-YYYY')
                    }
                    else {
                        return value
                    }
                })

                callback(null, transformedData);
            },
            function (data, callback) {
                var formDataJSON = {}
                formDataJSON['stashedSessionData'] = JSON.stringify(data.data)
                callback(null, formDataJSON)
            }
        ],

        function (err, formDataJSON) {

            if (err) {
                switch (err.status) {
                    case 400:
                        res.status(400).send({error: err.json})
                        break
                    case 404:
                        res.status(404).send({error: err.json})
                        break
                    default:
                        res.status(500).send({error: err.json})
                }
                return
            }

            rs.set({
                    app: config.server.redis.etdApplication.app,
                    token: token,
                    d: formDataJSON
                },
                _.partial((res, err, resp) => {

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
                }, res)
            )
        })
}

var updateSession = function (req, res) {

    var token = req.params.token
    var formsToRetain = urlUtility.parse(req.url, true).query.formName
    if (!(formsToRetain instanceof Array)) {
        formsToRetain = [formsToRetain]
    }

    if (typeof(token) === 'undefined') {
        res.status(400).send({error: 'missing param token'})
        return
    }

    async.waterfall([

            // GET form data
            function (callback) {
                rs.get({
                    app: config.server.redis.etdApplication.app,
                    token: token
                }, function (err, resp) {
                    if (err) {
                        callback({status: 500, json: err}, null)
                    }
                    if (resp) {
                        callback(null, resp.d);
                    }
                })
            },

            // DELETE & SEND data
            function (formDataJSON, callback) {
                Object.keys(formDataJSON).forEach(function (key) {
                    if (_.contains(formsToRetain, key)) {
                        delete formDataJSON[key]
                    } else {
                        formDataJSON[key] = null
                    }
                })
                callback(null, formDataJSON)
            }
        ],
        function (err, formDataToRetain) {
            // update the data with form data to retain

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
                    app: config.server.redis.etdApplication.app,
                    token: token,
                    d: formDataToRetain
                }, _.partial((res, err, resp) => {
                    if (err) {
                        res.status(500).send(err)
                        return
                    }
                    if (Object.keys(resp).length === 0) {
                        logger.error('missing-session')
                        res.status(404).send({error: 'missing-session'})
                        return
                    }
                    res.send(resp)
                }, res)
            )
        })
}

var getSessionForm = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        res.status(400).send({error: 'missing param token'})
        return
    }

    rs.get({
        app: config.server.redis.etdApplication.app,
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

        res.json(sessionDataTransformed);
    }, res))

}

var getSessionFormByFormName = function (req, res) {

    var token = req.params.token

    if (typeof(token) === 'undefined') {
        res.status(400).send({error: 'missing param token'})
        return
    }

    rs.get({
        app: config.server.redis.etdApplication.app,
        token: token
    }, _.partial(function (res, err, resp) {
        if (err) {
            res.status(500).send(err)
            return
        }
        if (Object.keys(resp).length === 0) {
            logger.error('missing-session')
            res.status(404).send({error: 'missing-session'})
            return
        }

        if (!resp.hasOwnProperty('d') ||
            (typeof(resp.d[req.params.formName]) === 'undefined')) {
            res.status(404).send({error: 'no data found for form name: ' + req.params.formName})
            return
        }

        res.json(JSON.parse(resp.d[req.params.formName]));
    }, res))
}

var getAppStatus = function (req, res) {
    res.send(200)
}

var deleteSessionFormByFormName = function (req, res) {
    var formNames = urlUtility.parse(req.url, true).query.formName
    var token = req.params.token

    if (typeof(token) === 'undefined') {
        res.status(400).send({error: 'missing param token'})
        return
    }

    async.waterfall([

        // GET form data
        function (callback) {

            rs.get({
                app: config.server.redis.etdApplication.app,
                token: token
            }, function (err, resp) {
                if (err) {
                    callback({status: 500, json: err}, null)
                }
                if (resp) {
                    callback(null, resp.d);
                }
            })

        },

        // DELETE data
        function (formDataJSON, callback) {

            if (formNames instanceof Array) {

                formNames.forEach(function (formName) {
                    formDataJSON[formName] = null
                })

            } else {
                formDataJSON[formNames] = null
            }

            callback(null, formDataJSON)

        },

        // SEND data
        function (formDataJSON, callback) {

            rs.set({
                app: config.server.redis.etdApplication.app,
                token: token,
                d: formDataJSON
            }, _.partial((res, err, resp) => {
                if (err) {
                    res.status(500).send(err)
                    return
                }
                if (Object.keys(resp).length === 0) {
                    logger.error('missing-session')
                    res.status(404).send({error: 'missing-session'})
                    return
                }
                res.send(resp)
            }, res))

        }

    ])
}

module.exports = {
    createSession,
    deleteSession,
    postSessionForm,
    updateSession,
    pdfStashedData,
    getSessionForm,
    getSessionFormByFormName,
    getAppStatus,
    deleteSessionFormByFormName
}
