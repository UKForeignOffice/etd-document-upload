'use strict';

var forms = require('newforms')
var InputTextWidget = require('../widget/InputTextWidget')

/**
 * The sole purpose of extending CharField is to override default input text widget to InputTextWidget.
 * @constructor
 * @extends {CharField}
 * @param {Object=} kwargs
 */
var CharField = forms.CharField.extend({
    widget: InputTextWidget

    , constructor: function CharField(kwargs) {
        if (!(this instanceof CharField)) { return new CharField(kwargs) }
        forms.CharField.call(this, kwargs)
    }
})

module.exports = CharField