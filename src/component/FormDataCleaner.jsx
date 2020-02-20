'use strict';

var RestClient= require('superagent-bluebird-promise')
var Global = require('./Global')
var logger = require('../utils/logs/logger').getLogger('FormDataCleaner')
var Promise = require('promise-polyfill')
var _ = require('lodash')
var FormDataCleaner = function (data) {

  this.data = data

  this.cleanData = function(){
    var formNamesToBeCleaned = this.determineWhatNeedsToBeCleanedIn(this.data)
    return formNamesToBeCleaned
  }

  this.determineWhatNeedsToBeCleanedIn = function (data) {
    var formNamesToBeCleaned = []

    var mandatoryForms = [
        data.SelfApplyingForm,
        data.BritishCitizenForm,
        data.BritishPassportForm,
        data.EtdReasonForm,
        data.JourneyDetailsForm,
        data.NameForm,
        data.PreviousNamesForm,
        data.ContactDetailsForm,
        data.PassportDetailsForm,
        data.PreviouslyReportedPassportsForm,
        data.WhatCountryForm,
        data.TellusJourneyForm,
        data.WhyTravelForm
    ]

    mandatoryForms.some( function (currentValue, index, array) {
      if  (typeof(currentValue) === 'undefined') {
        throw new Error('Missing mandatory form in FormDataCleaner: ' + index)
      }
    })

    if(_.contains(['expired', 'full', 'unavailable', 'neverHad'], data.EtdReasonForm.etdReason)){
      formNamesToBeCleaned.push('CircumstancesOfLossForm')
    }else{//lost or stolen
      formNamesToBeCleaned.push('PassportRenewalForm')
    }

      if (data.SelfApplyingForm.IsSelfApplying === 'Y') {
          formNamesToBeCleaned.push('BehalfApplyingForm')
      }

    return formNamesToBeCleaned
  }
}

FormDataCleaner.prototype.clean = function(callback){
  return callback.call(this,this.cleanData())
}

var deleteFromSession = function(token) {
  return function(formNames){

    if(formNames.length <= 0){
      return Promise.resolve()
    }

    var sessionApiUrl = Global.getSessionApiBaseUrl(token)
    var baseUrl = sessionApiUrl + '/form?formName='
    var queryParam = formNames.join('&formName=')
    var url = baseUrl + queryParam


    return RestClient.del(url).then(
      function (res) {
        return res
      },
      function (err) {
        logger.error(err)
      }
    )
  }
}

module.exports = {
  FormDataCleaner,
  deleteFromSession
}