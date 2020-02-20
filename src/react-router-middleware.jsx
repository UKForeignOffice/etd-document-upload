'use strict';

var React = require('react')
var assign = require('react/lib/Object.assign')
var Router = require('@insin/react-router')
var Redirect = require('@insin/react-router/lib/Redirect')
var RestClient= require('./utils/RestClient')
var async = require('async');
var config = require('config')
var JsonUtils = require('./utils/JsonUtils')
var Global = require('./component/Global')
var _ = require('lodash')

var setDefaultResponseHeaders = require('./utils/headerControl')

var {StaticLocation} = Router

var fetchData = require('./utils/fetchData')
var getTitle = require('./utils/getTitle')
var logger = require('./utils/logs/logger').getLogger('react-router-middleware')


var deleteCookieAndRedirectTo = function (res, path) {
  var exdate = new Date()
  res.cookie('accessToken', '', { path: '/', expires: exdate})
  res.redirect(303, path)
}

module.exports = function(routes, options) {
  if (!routes) {
    throw new Error('Routes must be provided')
  }
  options = assign({title: {}}, options)

  function renderApp(token, location, cb) {
    var router = Router.create({
      location,
      routes,

      onAbort(reason) {
        if (reason && reason.error === 'missing-session') {
          cb(null, router, {sessionTimeout: true}, null, null, null)
        }
        else if (reason instanceof Error) {
          cb (reason)
        }
        else if (reason instanceof Redirect) {
          cb(null, router, {redirect: reason, token: token})
        }
        else {
          cb(null, router, reason)
        }
      }
    })

    router.run((Handler, state) => {
      if (state.routes[0].name === 'notFound') {
        var html = React.renderToStaticMarkup(<Handler/>)
        var title = getTitle(state.routes, {}, {})
        return cb(null, router, {notFound: true}, html, null, title)
      }
      fetchData(token, state.routes, state.params, (err, fetchedData) => {
        if (err && err.error === 'missing-session') {
          return cb(null, router, {sessionTimeout: true}, null, null, null)
        }
        else if (err) {
          logger.error (err)
          return cb(null, router, {genericError: true}, null, null, null)
        }

        var props = _.merge({}, fetchedData, state.data)

        var html = React.renderToString(<Handler {...props}/>)
        var title = getTitle(state.routes, state.params, props, options.title)

        cb(null, router, null, html, JSON.stringify(JsonUtils.escape(props)), title)
      })
    })
  }

  function renderAppHandler(res, next, err, router, special, html, props, title) { // ಠ_ಠ
    if (err) {
      return next(err)
    }
    if (!special) {
      return res.render('react', {title, html, props,
          config: JSON.stringify(_.omit(config, 'server')),
          piwik: '//'.concat(config.client.piwik.url).concat('/piwik.php?idsite=').concat(config.client.piwik.siteId).concat("&rec=1")})
    }
    if (special.sessionTimeout) {
      logger.error ('session timeout')
      deleteCookieAndRedirectTo(res, `/session-timeout?url=${res.req.url}`)
      return
    }
    if (special.genericError) {
      logger.error ('generic error')
      deleteCookieAndRedirectTo(res, '/generic-error')
    }
    else if (special.notFound) {
      logger.error ('not found')
      res.status(404).render('react-404', {title, html})
    }
    else if (special.redirect) {
      var redirect = special.redirect
      var path = router.makePath(redirect.to, redirect.params, redirect.query)
      // Rather than introducing a server-specific abort reason object, use the
      // fact that a redirect has a data property as an indication that a
      // response should be rendered directly.
      if (redirect.data) {
        renderApp(
          special.token,
          new StaticLocation(path, redirect.data),
          renderAppHandler.bind(null, res, next)
        )
      }
      else {
        res.redirect(303, path)
      }
    }
    else {
      logger.error('Unexpected special response case: ', special.constructor, special)
      deleteCookieAndRedirectTo(res, '/generic-error')
    }
  }

  return function reactRouter(req, res, next) {
    // Provide the method and body of non-GET requests as a request-like object
    setDefaultResponseHeaders(res)

    async.waterfall([

        function(callback) {

          var accessToken = req.cookies['accessToken']

            if (req.path.endsWith('/third-party-payment') || req.path.endsWith('/appointment-done') || req.path.includes('/tasks') || req.path.startsWith('/doc') || req.path.startsWith('/doc/'))
                {
                  //Do nothing
                  logger.info(`Session - Path ${req.path} - Do not renew session`)
                }
            else
                {
                    //start a new journey for the user when visiting the Before You Start page, if a session exists and they hit the start page.
                    if (typeof (accessToken) !== 'undefined' && req.path.endsWith('/')) {
                        logger.info("Restarting form - New session needed")
                        deleteCookieAndRedirectTo(res, '/')
                    }
                    //redirect user to the start page if they hit any page after the start page without a session
                    else if (typeof (accessToken) === 'undefined' && !req.path.endsWith('/')) {
                        logger.info("No session and application page hit. Deleting cookie and redirecting to start page")
                        deleteCookieAndRedirectTo(res, '/')
                    }
                }

          if (((typeof (accessToken) === 'undefined' || accessToken === 'undefined') &&
              !(req.path.endsWith('/generic-error' || req.path.endsWith('/session-timeout'))))) {


              var host = config.common.host
              var port = config.common.port
              var apiBasePath = config.common.apiBasePath


              var promise = RestClient()
                  .post(`http://${host}:${port}${apiBasePath}/session`)
                  .query({'ip' : req.ip})
                  .query({'ttl' : config.server.redis.etdApplication.ttl })
                  .then(
                    function (res) {
                        var token = res.body.token
                        logger.info ('new session created [' + token + ']')
                        callback(null, token, true)
                    },
                  function (err) {
                      logger.error('error on creating the session',err)
                      res.redirect(303, '/generic-error')
                  })
              return promise.done()
          }
          else {
            callback(null, accessToken, false);
          }
        }
      ],

      function(err, tokenValue, createCookie) {
        if(err) { logger.error(err); res.status(500).send(err); return; }

        if (createCookie) {
            res.cookie('accessToken', tokenValue, { secure: Global.getConfig().cookie.secure, httpOnly: Global.getConfig().cookie.httpOnly })
        }

        var data = null
        if (req.method != 'GET') {
          data = {method: req.method, body: req.body, token: tokenValue}
        }
        else {
          data = {token: tokenValue}
        }

        var location = new StaticLocation(req.url, data)
        renderApp(tokenValue, location, renderAppHandler.bind(null, res, next))
      }
    )

  }
}
