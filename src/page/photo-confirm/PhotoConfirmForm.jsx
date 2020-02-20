'use strict'

var React = require('react')
var forms = require('newforms')
var _ = require('lodash')

var PiwikEvent = require('../../utils/PiwikEvent')
var Render = require('../../component/render/Render')
var TextAreaWidget = require('../../component/widget/TextAreaWidget')
var logger = require('../../utils/logs/logger').getLogger('photoConfirmForm')
var env = require('../../utils/env')

var photoAdditionalInfoRequired = false

var PhotoConfirmForm = forms.Form.extend({
    constructor: function (kwargs) {
        forms.Form.call(this, kwargs)
        if (_.get(kwargs, 'sessionData.PhotoUploadData.photoError')) {
            logger.debug('Photo error has been found: ' + _.get(kwargs, 'sessionData.PhotoUploadData.photoError'))
            photoAdditionalInfoRequired = true
        }
    },

    photoAdditionalInfo: forms.CharField({
        widget: TextAreaWidget,
        maxLength: 500,
        required: false,
        label: "Photo information (required if the photo failed to meet our checks)"
    }),

    cleanPhotoAdditionalInfo(callback) {
        if (this.cleanedData.photoAdditionalInfo) {
            PiwikEvent.fire("Photo confirmation: additional info added")
        }
        if (env.CLIENT && photoAdditionalInfoRequired && !this.cleanedData.photoAdditionalInfo) {
            throw forms.ValidationError('Provide a valid reason for your photo failing to meet our checks')
        }
        callback(null)
    },

    render() {
        var bfo = this.boundFieldsObj()

        return (
            <div>
                <p>Check your photo meets all the requirements in the following 3 categories:</p>
                <h3 className='heading-medium'>
                    1. Your appearance
                </h3>
                <p>Make sure</p>
                <p>
                    <ul className='list-bullet'>
                        <li>the photo is a good likeness of you that has been taken recently</li>
                        <li>your whole face and shoulders are visible with clear space around them</li>
                        <li>you have a plain or neutral expression</li>
                        <li>there are no reflections or glare (if you wear glasses)</li>
                        <li>you're not wearing headwear (unless for religious or medical reasons)</li>
                    </ul>
                </p>


                <h3 className='heading-medium'>
                    2. Photo set up
                </h3>
                <p>Your photo must:</p>
                <p>
                    <ul className='list-bullet'>
                        <li>have no other people or objects in it</li>
                        <li>be taken against a plain background (e.g. light grey or cream)</li>
                        <li>have no shadows on your face or behind you</li>
                    </ul>
                </p>
                <h3 className='heading-medium'>
                    3. Photo quality and format
                </h3>
                <p>Your photo must:

                    <ul className='list-bullet'>
                        <li>be in colour, with no effects of filters</li>
                        <li>not be blurred or have 'red eye'</li>
                        <li>be unedited - you can't 'correct' your emergency travel document photo</li>
                    </ul>

                    <a href="/photo-upload" id="id_redoPhotoUpload">Take a new photo</a> if you're
                    unsure.
                </p>

                {Render.section({body: Render.field(bfo.photoAdditionalInfo)})}
            </div>
        )
    }
})

module.exports = {
    PhotoConfirmForm
}
