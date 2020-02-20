
'use strict';

var forms = require('newforms')
var _ = require('lodash')

/**
 * An HTML <textarea rows="x" cols="y"> widget.
 * @constructor
 * @extends {TextInput}
 * @param {Object=} kwargs
 */
var TextAreaWidget = forms.Textarea.extend({
    constructor: function TextAreaWidget(kwargs) {
        if (!(this instanceof TextAreaWidget)) { return new TextAreaWidget(kwargs) }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute.  _off is required though is not a standard value. Otherwise, google chrome ignores.
        kwargs.attrs = _.extend({className: 'form-control', autoComplete: '_off'}, kwargs.attrs)
        forms.Textarea.call(this, kwargs)
    }
})

module.exports = TextAreaWidget