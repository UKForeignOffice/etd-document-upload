'use strict';

var forms = require('newforms')
var _ = require('lodash')

/**
 * An HTML Select widget.
 * @constructor
 * @extends {Select}
 * @param {Object=} kwargs
 */

var SelectWidget = forms.Select.extend({
    constructor: function SelectWidget(kwargs) {
        if (!(this instanceof SelectWidget)) { return new SelectWidget(kwargs) }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute.  _off is required though is not a standard value. Otherwise, google chrome ignores.
        kwargs.attrs = _.extend({className: 'form-control', autoComplete: '_off'}, kwargs.attrs)
        forms.Select.call(this, kwargs)
    }
})


module.exports = SelectWidget