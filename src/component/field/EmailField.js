'use strict';

var forms = require('newforms')
var EmailWidget = require('../widget/EmailWidget')

/**
 * The sole purpose of extending CharField is to override default email field to EmailWidget.
 * @constructor
 * @extends {EmailField}
 * @param {Object=} kwargs
 */
var EmailField = forms.EmailField.extend({
    widget: EmailWidget

    , constructor: function EmailField(kwargs) {
        if (!(this instanceof EmailField)) { return new EmailField(kwargs) }
        forms.EmailField.call(this, kwargs)
    }
})

module.exports = EmailField