'use strict'

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
            return (
                <div className="form-group file-upload-form">
                    <form encType="multipart/form-data" method="POST" action='http://localhost:8094/crop'
                          target='photo-result'>
                        <label htmlFor="uploadedimg">Choose file</label><br/>
                        <input type="file" name="photo" id="photo"/>
                        <button type="submit" className="button"/>
                    </form>
                </div>
            )
        }
    })
})

module.exports = RadioSelectWidget
