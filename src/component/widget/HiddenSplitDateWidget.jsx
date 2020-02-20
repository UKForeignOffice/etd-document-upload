'use strict';

var forms = require('newforms')
var _ = require('lodash')
var SplitDateWidget = require('./SplitDateWidget')

var HiddenSplitDateWidget = SplitDateWidget.extend({
    constructor: function HiddenSplitDateWidget(kwargs) {
        if (!(this instanceof HiddenSplitDateWidget)) {
            return new HiddenSplitDateWidget(kwargs)
        }

        kwargs = _.extend({}, kwargs)
        var widgets = [
            forms.HiddenInput({attrs: {label: "Day"}}),
            forms.HiddenInput({attrs: {label: "Month"}}),
            forms.HiddenInput({attrs: {label: "Year"}})
        ]

        kwargs.widgets = widgets

        SplitDateWidget.call(this, kwargs)
    },

    isHidden: function() {
        return false
    }
})

module.exports = HiddenSplitDateWidget