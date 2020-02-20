'use strict';

var forms = require('newforms')

var PhotoUploadData = forms.Form.extend({
    constructor: function (kwargs) {
        forms.Form.call(this, kwargs)
    },

    photoError: forms.CharField({
        widget: forms.HiddenInput,
        maxLength: 100,
        required: false
    }),

    filename: forms.CharField({
        widget: forms.HiddenInput,
        maxLength: 128,
        required: false
    }),

    canSubmit: forms.ChoiceField({
        choices: [['Y', 'Yes'], ['N', 'No']],
        widget: forms.HiddenInput,
        required: true
    }),

    clean(callback) {

        callback(null)
    }
})

module.exports = {
    PhotoUploadData
}
