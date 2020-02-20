'use strict';

var React = require('react')
var forms = require('newforms')
var Typeahead = require('./lib/Typeahead')
var _ = require('lodash')

/**
 * An object used by choice Selects to enable customisation of react-autocomplete.
 * @constructor
 * @param {string} name
 * @param {string} value
 * @param {Object} attrs
 * @param {boolean} controlled
 * @param {Array} choices
 */
var TypeaheadFieldRenderer = forms.ChoiceFieldRenderer.extend({
    constructor: function TypeaheadFieldRenderer(name, value, attrs, controlled, choices, config) {
        if (!(this instanceof TypeaheadFieldRenderer)) {
            return new TypeaheadFieldRenderer(name, value, attrs, controlled, choices, config)
        }

        this.name = name
        this.value = value
        this.attrs = attrs
        this.controlled = controlled
        this.choices = choices
        this.config = config
    }
})

TypeaheadFieldRenderer.prototype.render = function () {

    var self = this

    var inputProps = {
        id: "id_" + this.name,
        name: this.name,
        className: 'form-control'
    }

    var prepareItems = function (choices, config) {

        return _.map(choices, function (choice) {
            var item = {
                'value': choice[0],
                'label': choice[1]
            }

            // prepare the 'matches' string which must be filtered on later
            item['matches'] = item['label']
            var synonym = _.result(_.find(config, {'label': item['label']}), 'synonym')

            if (synonym) {
                item['matches'] += ' ' + synonym
            }

            return item
        })
    }

    /**
     * Loose matching of search terms
     */
    var matchItem = function (item, value) {

        var filterEmptySearchTerm = function (searchTerm) {
            return searchTerm.length > 0
        }

        var mapSearchTermToRegex = function (searchTerm) {
            return new RegExp(_.escapeRegExp(searchTerm), "i")
        }

        //
        // Prepare regular expressions for search terms
        //
        var matchers = _.chain(value.split(' '))
            .filter(filterEmptySearchTerm)
            .map(mapSearchTermToRegex)
            .value()

        var res = _.all(matchers, function (matcher) {
            return matcher.test(item['matches'])
        })

        return res
    }

    return <Typeahead
        initialValue={this.value}
        inputProps={inputProps}
        items={prepareItems(this.choices, this.config)}
        getItemValue={(item) => item['value']}
        onSelect={(value, item) => {
            self.value = value
        }}
        shouldItemRender={matchItem}
        renderItem={(item, isHighlighted) => (
            <div
                className={isHighlighted?'typeahead-item typeahead-highlighted':'typeahead-item'}
                key={item['value']}>
                {item['label']}
            </div>
          )}
        renderMenu={(items, value, style) => {
                var inlineStyle = {
                    minWidth: style.minWidth,
                    maxWidth: style.minWidth
                }
                return <div style={inlineStyle} className={'typeahead-menu'} children={items} />
            }
        }
        />
}

/**
 * An HTML Type-ahead widget.
 * @constructor
 * @extends {Widget}
 * @param {Object=} kwargs
 */
var TypeaheadWidget = forms.Select.extend({
    __mixins__: [forms.RendererMixin],
    constructor: function TypeaheadWidget(kwargs) {
        if (!(this instanceof TypeaheadWidget)) {
            return new TypeaheadWidget(kwargs)
        }
        kwargs = _.extend({'config': []}, kwargs)
        forms.RendererMixin.call(this, kwargs)
        forms.Select.call(this, kwargs)
        this.config = kwargs.config
    },

    render: function (name, value, kwargs) {
        return this.getRenderer(name, value, kwargs).render()
    },

    getRenderer: function (name, value, kwargs) {
        kwargs = _.extend({'choices': [], 'config': this.config, 'controlled': false}, kwargs)
        if (value === null) {
            value = this._emptyValue
        }
        var finalAttrs = this.buildAttrs(kwargs.attrs)
        var choices = this.choices.concat(kwargs.choices)
        return new this.renderer(name, value, finalAttrs, kwargs.controlled, choices, kwargs.config)
    },

    renderer: TypeaheadFieldRenderer
})


module.exports = TypeaheadWidget