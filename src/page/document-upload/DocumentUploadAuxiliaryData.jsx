'use strict';

var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var DataService = require('../../utils/DataService')

var DocumentUploadAuxiliaryData = function(params, data, cb) {
    DataService.getPosts().then(
        function(posts) {
            cb(null, new IsomorphicFormDataHolder(data).setAuxiliaryData({'posts': posts}).getData())
        },
        function(err) {
            cb(err, new IsomorphicFormDataHolder(data).getData())
        }
    ).done()
}

module.exports = DocumentUploadAuxiliaryData

