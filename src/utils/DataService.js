'use strict';

var Global = require('../component/Global')
var RestClient = require('./RestClient')
var _ = require('lodash')

var getCountries = function (countryId) {

    var url = Global.getCountryDataServiceUrl()
    if (countryId) {
        url += '?countryId=' + countryId
    }

    return RestClient().get(url).then(
        function (res) {
            return res.body
        }
    )
}
// checking for courier support with specific country and returning either true or false

var checkCountryForCourier = function (label) {
    var url = Global.getCourierSupportDetails()
    if (label) {
        // debugger
        url += '?label=' + label;
        return RestClient().get(url).then(
            function(res)
            {
            // console.log(res.body)
            return res.body;
        });
        // fetch(url).
        //     then( function (res) {
        //         res.json()
        //     }).
        //     then(function (jsonRes) {
        //         return _.first(jsonRes).courier
        //     })
    }
}
//TODO: use loadash to check for the courier support and return true or false in here

var getCountriesByLabel = function (label) {
    var url = Global.getCountryDataServiceUrl()
    if (label) {
        url += '?label=' + encodeURIComponent(label)
        return RestClient().get(url).then(

            function (res) {
                return res.body
            }
        )
    }
}

var getCountriesByIsSkipTravelAdvice = function (skipTravelAdvice) {
    var url = Global.getCountryDataServiceUrl()
    if (skipTravelAdvice) {
        url += '?skipTravelAdvice=' + skipTravelAdvice
    }

    return RestClient().get(url).then(
        function (res) {
            return res.body
        }
    )
}

var getPosts = function (postId, url) {
    if (_.isEmpty(url)) {
        url = Global.getPostDataServiceUrl()
    }
    if (postId) {
        url += '?postId=' + postId
    }

    return RestClient().get(url).then(
        function (res) {
            return res.body
        }
    )
}

var getPostsByPrefix = function (prefix) {

    var url = Global.getPostDataServiceUrl()
    if (prefix) {
        url += '?prefix=' + prefix
    }

    return RestClient().get(url).then(
        function (res) {
            return res.body
        }
    )
}

var getTasklistData = function (tasklistToken) {
    return RestClient()
        .get(Global.getTasklistApiBaseUrl(tasklistToken))
        .then(
            function (res) {
                return res.body
            }
        )
}

var getCountryCode = function (countryName) {
    return RestClient()
        .get(Global.getCountryCodeUrl(countryName))
        .then(
            function (res) {
                return res.text
            }
        )
}

module.exports = {
    getCountries: getCountries,
    getCountriesByLabel: getCountriesByLabel,
    getPosts: getPosts,
    getPostsByPrefix: getPostsByPrefix,
    getCountriesByIsSkipTravelAdvice: getCountriesByIsSkipTravelAdvice,
    getTasklistData: getTasklistData,
    checkCountryForCourier: checkCountryForCourier,
    getCountryCode: getCountryCode
}
