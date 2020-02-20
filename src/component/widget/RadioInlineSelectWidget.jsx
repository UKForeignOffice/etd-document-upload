'use strict';

var forms = require('newforms')
var _ = require('lodash')
var React = require('react')
var RadioSelectWidget = require('./RadioSelectWidget')

/**
 * An HTML RadioSelect Inline widget.
 * @constructor
 * @extends {TextInput}
 * @param {Object=} kwargs
 */
var RadioSelectInlineWidget = RadioSelectWidget.extend({
    constructor: function RadioSelectInlineWidget(kwargs) {
        if (!(this instanceof RadioSelectInlineWidget)) {
            return new RadioSelectInlineWidget(kwargs)
        }

        // Ensure we have something in attrs
        kwargs = _.extend({attrs: null}, kwargs)
        // Provide default class attribute
        RadioSelectWidget.call(this, kwargs)
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
            return <div className="inline form-group form-group-compound default">
                {radioSelectWidget}
            </div>
        }
    })
})

module.exports = RadioSelectInlineWidget