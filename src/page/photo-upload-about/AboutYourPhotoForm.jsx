'use strict'

var React = require('react')
var _ = require('lodash')
var forms = require('newforms')
var ChoiceField = require('../../component/field/ChoiceField')
var CheckboxSelectMultipleWidget = require('../../component/widget/CheckboxSelectMultipleWidget')
var AboutYourPhotoAuxiliaryData = require('./AboutYourPhotoAuxiliaryData')
var PiwikEvent = require('../../utils/PiwikEvent')

var AboutYourPhotoForm = forms.Form.extend({
    constructor: function (kwargs) {
        forms.Form.call(this, kwargs)
        this.fromLink = _.get(kwargs, 'sessionData.UploadData.fromLink')
    },

    // For posts allowing online photo uploads, a 'Y' value here means user has agreed to manually send in photo instead of uploading one
    howSupplyingPhoto: ChoiceField({
        validation: {on: 'change'},
        label: "",
        required: false,
        helpText: "",
        choices: "Y",
        widget: CheckboxSelectMultipleWidget,
        errorMessages: {required: "Tell us how you will supply your photo"}
    }),

    cleanHowSupplyingPhoto(callback) {
        PiwikEvent.fire("I will bring/post a photo.", this.cleanedData.howSupplyingPhoto)
        callback(null)
    },

    clean(callback) {
        callback(null)
    },

    render() {
        return (
            <div />
        )
    }
})

AboutYourPhotoForm.FetchAuxiliaryData = AboutYourPhotoAuxiliaryData

module.exports = {
    AboutYourPhotoForm
}
