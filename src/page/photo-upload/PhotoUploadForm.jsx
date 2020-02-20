'use strict';

var React = require('react')
var forms = require('newforms')
var ChoiceField = require('../../component/field/ChoiceField')
var CheckboxSelectMultipleWidget = require('../../component/widget/CheckboxSelectMultipleWidget')
var Render = require('../../component/render/Render')
var _ = require('lodash')
var RestClient = require('../../utils/RestClient')
var PiwikEvent = require('../../utils/PiwikEvent')
var Global = require('../../component/Global')
var env = require('../../utils/env')

var generateErrorMessage = function (code) {
    switch (code) {
        case 'file-type-not-permitted':
            return 'The type of file you are adding is not permitted. Valid file formats include .jpeg, .gif, .png'
        case 'max-image-size-exceeded':
            return 'The file that you are adding is too big. You will need to provide a photo in a file that is no more than 10 Megabytes'
        case 'file-checks-failed':
            return 'The file that you are trying to add did not pass our virus checks. You will need to provide us with another photo'
        default:
            return 'An error has occurred. We are experiencing technical problems and are unable to process your photo. Use your browsers back button to try again. If this doesn’t work try again shortly'
    }
}

var validMimeTypes = [
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png"
]

var PhotoUploadForm = forms.Form.extend({
    constructor: function (kwargs) {
        forms.Form.call(this, kwargs)
    },

    photo: forms.ImageField({
        label: 'Choose photo',
        required: false,
        maxSize: '10MB',
        accept: ['png', 'jpg'],
        helpText: "This opens your files to choose from"
    }),

    photoConfirmation: ChoiceField({
        choices: [["Y", "I confirm that this is a true likeness of myself/the applicant"]],
        label: "",
        required: true,
        helpText: "",
        widget: CheckboxSelectMultipleWidget,
        errorMessages: {required: "Confirm that this is a true likeness of yourself/the applicant"}
    }),

    photoStatus: forms.CharField({
        widget: forms.HiddenInput,
        required: false
    }),

    photoCanSubmit: forms.CharField({
        widget: forms.HiddenInput,
        required: false
    }),

    cleanPhoto: function (callback) {
        callback(null)
    },

    cleanPhotoConfirmation(callback) {
        if (this.cleanedData.photoConfirmation) {
            PiwikEvent.fire("Confirmed that this is a true likeness of the applicant.", this.cleanedData.photoConfirmation)
        }
        callback(null)
    },

    clean(callback) {
        if (env.CLIENT) {
            if (!this.cleanedData.photo || !this.cleanedData.photo.name) {
                this.addError('photo', 'Choose a photo to upload')
                return
            }
            if (this.cleanedData.photo.size > Global.getMaxSingleDocumentSize()) {
                this.addError('photo', generateErrorMessage('max-image-size-exceeded'))
                return
            }
            if (!_.includes(validMimeTypes, this.cleanedData.photo.type)) {
                this.addError('photo', generateErrorMessage('file-type-not-permitted'))
                return
            }
            RestClient()
                .post(Global.getPhotoUploadUrl())
                .attach('photo', this.cleanedData.photo)
                .timeout(600000)
                .end((err, res) => {
                    if (err || res.serverError || res.clientError || ['ok', 'missing-session', 'session-timeout'].indexOf(res.text) === -1) {
                        this.addError('photo', generateErrorMessage(res.text))
                    } else {
                        callback(null)
                    }
                })
        } else {
            callback(null)
        }
    },

    render() {
        var bfo = this.boundFieldsObj()

        return (
            <div className="form-group file-upload-form">
                {Render.section({body: Render.field(bfo.photo)})}
                {Render.section({body: Render.field(bfo.photoConfirmation)})}
            </div>
        )
    }
})

module.exports = {
    PhotoUploadForm
}
