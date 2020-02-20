'use strict';

var React = require('react')
var env = require('../utils/env')

var Global = React.createClass({

    statics: {
        getConfig() {
            if (env.CLIENT) {
                if (typeof window['__CONFIG__'] === 'undefined') {
                    throw Error('Client configuration not set up properly.')
                }
                return window['__CONFIG__']
            } else {
                return require('config')
            }
        },

        getBaseUrl() {
            return env.SERVER ? 'http://'+ this.getConfig().common.host + ':' + this.getConfig().common.port : ''
        },

        getApiBaseUrl() {
            return this.getBaseUrl() + this.getConfig().common.apiBasePath
        },

        getValidateBirthDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateBirthDateServiceUrl : this.getConfig().client.validateBirthDateServiceUrl
        },

        getValidateDepartureDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateDepartureDateServiceUrl : this.getConfig().client.validateDepartureDateServiceUrl
        },

        getValidatePassportIssueDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validatePassportIssueDateServiceUrl : this.getConfig().client.validatePassportIssueDateServiceUrl
        },

        getValidatePassportExpiryDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validatePassportExpiryDateServiceUrl : this.getConfig().client.validatePassportExpiryDateServiceUrl
        },

        getValidatePassportLastSeenDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validatePassportLastSeenDateServiceUrl : this.getConfig().client.validatePassportLastSeenDateServiceUrl
        },

        getValidateApplicationDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateApplicationDateServiceUrl : this.getConfig().client.validateApplicationDateServiceUrl
        },

        getValidateArrivalDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateArrivalDateServiceUrl : this.getConfig().client.validateArrivalDateServiceUrl
        },

        getValidateReturnArrivalDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateReturnArrivalDateServiceUrl : this.getConfig().client.validateReturnArrivalDateServiceUrl
        },

        getValidateReturnDepartureDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateReturnDepartureDateServiceUrl : this.getConfig().client.validateReturnDepartureDateServiceUrl
        },

        getValidateRepresentativeBirthDateServiceUrl() {
            return env.SERVER ? this.getConfig().server.validateRepresentativeBirthDateServiceUrl : this.getConfig().client.validateRepresentativeBirthDateServiceUrl
        },

        getCalculateAgeServiceUrl() {
            return env.SERVER ? this.getConfig().server.calculateAgeServiceUrl : this.getConfig().client.calculateAgeServiceUrl
        },

        getCountryDataServiceUrl() {
            return env.SERVER ? this.getConfig().server.countryDataServiceUrl : this.getConfig().client.countryDataServiceUrl
        },
        getCourierSupportDetails () {
            return env.SERVER ? this.getConfig().server.checkCourierSupportWithCountryName : this.getConfig().client.checkCourierSupportWithCountryName
        },
        getCountryCasebookLabelServiceUrl() {
            return env.SERVER ? this.getConfig().server.countryCasebookLabelServiceUrl : this.getConfig().client.countryCasebookLabelServiceUrl
        },

        getPostDataServiceUrl() {
            return env.SERVER ? this.getConfig().server.postDataServiceUrl : this.getConfig().client.postDataServiceUrl
        },

        getPostDataPublicServiceUrl() {
            return env.SERVER ? this.getConfig().server.postDataPublicServiceUrl : this.getConfig().client.postDataPublicServiceUrl
        },

        getThirdPartyPaymentUrl() {
            return env.SERVER ? this.getConfig().server.thirdPartyPaymentUrl : this.getConfig().client.thirdPartyPaymentUrl
        },

        getPhotoDisplayUrl() {
            return env.SERVER ? this.getConfig().server.photoDisplayUrl : this.getConfig().client.photoDisplayUrl
        },

        getPhotoUploadUrl() {
            return env.SERVER ? this.getConfig().server.photoUploadUrl : this.getConfig().client.photoUploadUrl
        },

        getDocumentUploadUrl() {
            return env.SERVER ? this.getConfig().server.documentUploadUrl : this.getConfig().client.documentUploadUrl
        },

        getDocumentSendUrl() {
            return env.SERVER ? this.getConfig().server.documentSendUrl : this.getConfig().client.documentSendUrl
        },

        getPhotoConfirmUrl() {
            return env.SERVER ? this.getConfig().server.photoConfirmUrl : this.getConfig().client.photoConfirmUrl
        },

        getDhlRateRequestUrl() {
            return env.SERVER ? this.getConfig().server.dhlRateRequestUrl : this.getConfig().client.dhlRateRequestUrl
        },

        getCountryCodeUrl(countryName) {
            var url = this.getCountryCodeBaseUrl()
            if (countryName) {
                url += '?countryName=' + countryName
            }
            return url
        },

        getCountryCodeBaseUrl() {
            return env.SERVER ? this.getConfig().server.countryCodeUrl : this.getConfig().client.countryCodeUrl
        },

        getCookie(cname) {
            if (env.SERVER ) {
                throw Error("Cannot retrieve cookie in non-browser environments (i.e. NodeJs environment). " +
                            "No window object exits.")
            }
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length,c.length);
                }
            }
            return "";
        },

        getEtdPrice(){
            return env.SERVER ? this.getConfig().server.payment.amountToPay : this.getConfig().client.payment.amountToPay
        },

        deleteCookie(cname) {
            if (env.SERVER ) {
                throw Error("Cannot retrieve cookie in non-browser environments (i.e. NodeJs environment). " +
                            "No window object exits.")
            }
            document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },

        getAccessToken(accessToken){
            if(env.SERVER){
                return accessToken
            }
            return this.getCookie('accessToken', document)
        },

        getSessionApiBaseUrl(accessToken) {
            var url = `${this.getApiBaseUrl()}/session`
            if(env.SERVER || this.getConfig().client.injectSessionIdInURL) {
                url = `${url}/${this.getAccessToken(accessToken)}`
            }
            return url
        },

        getTasklistApiBaseUrl(tasklistToken) {
            var url = `${this.getApiBaseUrl()}/tasklist`
            if(tasklistToken) {
                url = `${url}/${tasklistToken}`
            }
            return url
        },

        getTypeaheadConfig() {
            return this.getConfig().client.typeahead
        },
        scrollToTop() {
            if (env.CLIENT) {
                window.scrollTo(0,0)
            }
        },

        getMaxSingleDocumentSize() {
            return env.SERVER ? this.getConfig().server.maxSingleFileSize : this.getConfig().client.maxSingleFileSize
        },

        getMaxCombinedDocumentSize() {
            return env.SERVER ? this.getConfig().server.maxCombinedFileSize : this.getConfig().client.maxCombinedFileSize
        },

    },

    shouldComponentUpdate() {
        return false;
    },

    render() {
        return <span></span>
    }

});

module.exports = Global;
