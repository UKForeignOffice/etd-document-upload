'use strict';

var forms = require('newforms')
var _ = require('lodash')
var React = require('react')

/**
 * An HTML RadioSelect widget.
 * @constructor
 * @extends {TextInput}
 * @param {Object=} kwargs
 */
var RadioSelectWidget = forms.RadioSelect.extend({
    constructor: function RadioSelectWidget(kwargs) {
        if (!(this instanceof RadioSelectWidget)) {
            return new RadioSelectWidget(kwargs)
        }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute
        forms.RadioSelect.call(this, kwargs)
    },

    renderer: forms.RadioFieldRenderer.extend({
        render: function () {
            var radioSelectWidget = this.choiceInputs().map(function (input) {
                var classList = ''
                if(input.choiceValue === input.value){
                    classList = classList + " selected"
                }
                return <div className="multiple-choice">
               		{input.tag()}
                <label className={classList} htmlFor={input.idForLabel()}>
               		{input.choiceLabel}
                </label>
				</div>
            })
            return <div className="form-group form-group-compound default">
                {radioSelectWidget}
            </div>
        }
    })
})

module.exports = RadioSelectWidget