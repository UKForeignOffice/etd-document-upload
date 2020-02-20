'use strict';

var TypeaheadWidget = require('../widget/TypeaheadWidget')
var SelectWidget = require('../../component/widget/SelectWidget')
var modernizr = require('../../utils/modernizr')
var env = require('../../utils/env')

var enableSelectWidget = function (field) {
    field.widget = SelectWidget()
    field.setChoices(field.choices())
}

var enableTypeaheadWidget = function (field, config) {
    field.widget = TypeaheadWidget({'config': config})
    field.setChoices(field.choices())
}

var setTypeaheadWidget = function (field, choices, config) {

    var prepend = function (value, array) {
        var newArray = array.slice(0)
        newArray.unshift(value)
        return newArray
    }

    field.setChoices(prepend('', choices))

    if (env.CLIENT) {
        if (!modernizr.isTouchDevice()) {
            field.setChoices(choices)
            enableTypeaheadWidget(field, config)
        } else {
            enableSelectWidget(field)
        }
    }
}

module.exports = {
    setTypeaheadWidget
}