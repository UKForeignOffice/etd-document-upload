'use strict';

var forms = require('newforms')
var RadioSelectWidget = require('../widget/RadioSelectWidget')

/**
 * The sole purpose of extending ChoiceField is to override default RadioSelect widget renderer.
 * @constructor
 * @extends {ChoiceField}
 * @param {Object=} kwargs
 */
var ChoiceField = forms.ChoiceField.extend({
    widget: RadioSelectWidget,

    constructor: function ChoiceField(kwargs) {
        if (!(this instanceof ChoiceField)) {
            return new ChoiceField(kwargs)
        }
        forms.ChoiceField.call(this, kwargs)
    }
})

module.exports = ChoiceField