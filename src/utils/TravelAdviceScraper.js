'use strict';

var cheerio = require('cheerio')
var _ = require('lodash')
var async = require('async')
var RestClient = require('superagent-bluebird-promise')
var logger = require('./logs/logger').getLogger('TravelAdviceScraper')
var sanitizer = require('sanitizer')

var TravelAdviceScraper = function (url, marker, timeout) {

    var self = this

    var buildUrlFor = function (slug) {
        return `${url}/${slug}.json`
    }

    var unescapeUnicode = function(s) {
        return JSON.parse('"' + s.replace('"', '\\"') + '"')
    }

    /**
     * Parse the HTML content searching for the ETD travel advice section delimited by the marker.
     *
     * @param content the HTML containing the ETD travel advice section searched for.
     * @returns the ETD travel advice section or null if no match is found
     */
    self.parse = function (content) {

        var filterByMarker = function () {
            return $(this).text().toLowerCase() === marker.toLowerCase()
        }

        var $ = cheerio.load(content)
        var element = $('h3').filter(filterByMarker).next('p')

        if (element && element.length > 0) {
            return element.text()
        }

        return null
    }

    var getTravelAdviceFor = function (slug, callback) {
        RestClient.get(buildUrlFor(slug)).then(
            function (res) {
                logger.info(`GET ${buildUrlFor(slug)} successful`)
                var parsed = self.parse(res.text)
                if(parsed){
                    callback(null, unescapeUnicode(sanitizer.sanitize(parsed)))
                } else {
                    callback(null, null)
                }
            },
            function (err) {
                logger.error(`GET ${buildUrlFor(slug)} ${err}`)
                callback(null, null)
            }
        ).timeout(timeout)
    }

    self.findTravelAdviceFor = function (slugs, callback, exclusionList) {
        var addFunctionForSeries = slugs.map((slug) => {
            return function (callback) {
                if (exclusionList.indexOf(slug) === -1) {
                    getTravelAdviceFor(slug, callback)
                }
                else {
                    callback(null, null)
                }
            }
        })

        var slugTasks = _.zipObject(slugs, addFunctionForSeries)

        return async.series(slugTasks, function (err, results) {
            if (err) {
                callback(err, null)
            }
            callback(null, results)
        })
    }

}

module.exports = TravelAdviceScraper
