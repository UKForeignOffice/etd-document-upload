'use strict';

var path = require('path')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var compression = require('compression')
var errorhandler = require('errorhandler')
var express = require('express')
var favicon = require('serve-favicon')
var serveStatic = require('serve-static')
var config = require('config')
var log4js = require('log4js')

var pkg = require('../package.json')
var loggingContext = require('./utils/logs/log-ctx')

var app = express()
app.disable('x-powered-by')
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

// app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto', format: config.server.logs.accessLogs.pattern, nolog: "/api/healthcheck"}))

app.set('host', config.common.host)
app.set('port', config.common.port)
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../views'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(compression())
app.use(favicon(path.join(__dirname, '../static/favicon.ico')))
app.use(serveStatic(path.join(__dirname, '../static')))
app.use(cookieParser())
app.use(loggingContext)

module.exports = {
    app : app
}

app.use('/api', require('./apiRoute'))
app.use('/application', require('./applicationRoute'))
app.use('/client-logger', require('./clientLoggerRoute'))

var reactRouter = require('./react-router-middleware')
app.use(reactRouter(require('./routes')))

if ('development' == app.get('env')) {
  app.use(errorhandler())
}

var logger = require('./utils/logs/logger').getLogger('server')
process.on('uncaughtException', function (err) {
  	logger.error(err)
})

app.listen(app.get('port'), app.get('host'), () => {
	logger.info(`${pkg.name} server listening on http://${app.get('host')}:${app.get('port')}`)
})
