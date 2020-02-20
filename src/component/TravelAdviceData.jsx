'use strict';

var IsomorphicFormDataHolder = require("./IsomorphicFormDataHolder")
var _ = require('lodash')
var Global = require("./Global")
var logger = require('../utils/logs/logger').getLogger('TravelAdviceData')
var TravelAdviceScraper = require('../utils/TravelAdviceScraper')
var urlUtility = require('url')
var RestClient= require('superagent-bluebird-promise')

var TravelAdviceData = function(params, data, countries, cb) {

  var self = this
  var dataHolder = new IsomorphicFormDataHolder(data)

    self.getCountryList = function(transitData,nowCountryData){
      if (!nowCountryData || !transitData) {
          logger.error('Missing session data')
          cb({error: 'missing-session'}, data.getData())
          return
      }
      var dataOrder = [
        nowCountryData.nowCountry,
        transitData.transitToDestination1,
        transitData.transitToDestination2,
        transitData.transitToDestination3,
        transitData.transitToDestination4,
        transitData.transitToDestination5,
        transitData.destinationCountry,
        transitData.transitReturnDestination1,
        transitData.transitReturnDestination2,
        transitData.transitReturnDestination3,
        transitData.transitReturnDestination4,
        transitData.transitReturnDestination5
      ]

      var dataCleaned = _.uniq(_.compact(dataOrder))
      return dataCleaned
    }

    self.countries = countries

    self.getCountrySlugForName = function(countryName){
      var configCountryList = self.countries

      return _.result(_.find(configCountryList, 'label', countryName), 'countryId')
    }

    self.getCountrySlugList = function(countryList){
      var slugList = _.map(countryList, function(countryName){
        return self.getCountrySlugForName(countryName)
      })
      return slugList
    }

    self.completeTravelAdviceData = function(travelAdvice){

      var notFoundMessage = Global.getConfig().client.travelAdviceNotFoundMessage

      var customMessages = Global.getConfig().client.travelAdviceCustomMessages

      var fullTravelAdvice = _.transform(travelAdvice, function(result, advice, slug){

        var finalAdvice = advice

        if(!advice){
          logger.info("completeTravelAdviceData - use 'notFoundMessage' for: " + slug)
          finalAdvice = notFoundMessage
        }

        if(customMessages[slug]){
          logger.info("completeTravelAdviceData - use 'customMessage': " + customMessages[slug])
          finalAdvice = customMessages[slug]
        }

        result[slug] = {
          'advice': finalAdvice
        }
      })

      return fullTravelAdvice
    }

    self.formattedData = function(countryList, travelAdvice){

      var data = _.map(countryList, function(countryName){
        var slug = self.getCountrySlugForName(countryName)
        var getAdvice = travelAdvice[slug]
        return {
          'title': countryName,
          'advice': getAdvice.advice,
          'slug': slug
        }
      })
      return data
    }

    self.getData = function(){
      var sessionData = dataHolder.getSessionData()

      self.countryList = self.getCountryList(sessionData.JourneyDetailsForm,sessionData.WhatCountryForm)


      var countrySlugList = self.getCountrySlugList(self.countryList)

      if(countrySlugList.length <= 0){
        cb(null, null)
      }

      var apiUrl = Global.getApiBaseUrl(params.token)
      var baseUrl = apiUrl + '/advice?countryName='
      var queryParam = countrySlugList.join('&countryName=')
      var url = baseUrl + queryParam

      RestClient.get(url).then(
        function (res) {
          self.dataCallback(null, res.body)
        },
        function (err) {
          self.dataCallback(err)
        }
      )
    }

    self.dataCallback = function(err, res){
      if(err){
        logger.error(err)
        cb(null, null)
      }
      var travelAdvice = self.completeTravelAdviceData(res)

      var auxiliaryData = self.formattedData(self.countryList, travelAdvice)

      cb(null, dataHolder
          .setAuxiliaryData(auxiliaryData)
          .getData())
    }
}

var getTravelAdviceForCountries = function (req, res) {

  var dataCallback = function(err, results){
    if(err){
      res.send(err, 400)
    }
    res.send(results)
  }

  var travelAdviceSettings = Global.getConfig().client.travelAdviceScraping
  var url = travelAdviceSettings.url
  var marker = travelAdviceSettings.marker
  var timeout = travelAdviceSettings.timeout

  var exclusionList = _.keysIn(Global.getConfig().client.travelAdviceCustomMessages)

  var countryNames = urlUtility.parse(req.url, true).query.countryName
  if(typeof(countryNames) == 'string'){
    countryNames = [countryNames]
  }

  var travelAdviceScraper = new TravelAdviceScraper(url, marker, timeout)

  travelAdviceScraper.findTravelAdviceFor(countryNames, dataCallback, exclusionList)

}

module.exports = {
  TravelAdviceData,
  getTravelAdviceForCountries
}

