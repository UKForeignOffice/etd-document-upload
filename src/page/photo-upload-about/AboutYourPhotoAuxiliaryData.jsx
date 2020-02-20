'use strict';

var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var DataService = require('../../utils/DataService')

var AboutYourPhotoAuxiliaryData = function(params, data, cb) {
    DataService.getPosts().then(
        function(posts) {
            cb(null, new IsomorphicFormDataHolder(data).setAuxiliaryData({'posts': posts}).getData())
        }
    ).done()
}

module.exports = AboutYourPhotoAuxiliaryData

