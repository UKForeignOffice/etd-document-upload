'use strict';

/**
 * Mostly copy-paste of https://github.com/rackt/react-autocomplete with a slight variations in the code which couldn't be overcome
 * programatically.
 *
 * See original code [Line 301] https://github.com/rackt/react-autocomplete/blob/master/lib/Autocomplete.js#L301
 * The root div element comes with a style={{display: 'inline-block'}} which cannot be controlled though the API.
 * Since this inline-block style interferes with the GDS guidelines it needed to be suppressed.
 * This has been replaced with  className="form-group" which is inline with the GDS guidelines.
 *
 * Choices were:
 *   1. Module Monkey-patching: Not an option as simply not possible when it comes to ReactJs components
 *   2. Forking the original project: By far the cleanest approach although adds a lot of overhead which couldn't
 *      be justified for a module that is basically just one file.
 *   3. Copy-pasting the one file into the project: The preferred option.
 */

var React = require('react')
var scrollIntoView = require('dom-scroll-into-view')
var _ = require('lodash')

var _debugStates = []

var HANDLERS = {
    ArrowDown (event) {
        event.preventDefault()
        var { highlightedIndex } = this.state
        var index = (
            highlightedIndex === null ||
            highlightedIndex === this.getFilteredItems().length - 1
        ) ? 0 : highlightedIndex + 1
        this._performAutoCompleteOnKeyUp = true
        this.setState({
            highlightedIndex: index,
            isOpen: true
        })
    },

    ArrowUp (event) {
        event.preventDefault()
        var { highlightedIndex } = this.state
        var index = (
            highlightedIndex === 0 ||
            highlightedIndex === null
        ) ? this.getFilteredItems().length - 1 : highlightedIndex - 1
        this._performAutoCompleteOnKeyUp = true
        this.setState({
            highlightedIndex: index,
            isOpen: true
        })
    },

    Enter: function (preventDefault) {
        return function (event) {
            if (preventDefault) {
                event.preventDefault()
            }
            if (this.state.isOpen === false) {
                // already selected this, do nothing
                return
            }
            else if (this.state.highlightedIndex == null) {
                // hit enter after focus but before typing anything so no autocomplete attempt yet
                this.setState({
                    isOpen: false
                }, () => {
                    React.findDOMNode(this.refs.input).select()
                })
            }
            else {
                var item = this.getFilteredItems()[this.state.highlightedIndex]
                this.setState({
                    value: this.props.getItemValue(item),
                    isOpen: false,
                    highlightedIndex: null
                }, () => {
                    //React.findDOMNode(this.refs.input).focus() // TODO: file issue
                    React.findDOMNode(this.refs.input).setSelectionRange(
                        this.state.value.length,
                        this.state.value.length
                    )
                    this.props.onSelect(this.state.value, item)
                })
            }
        }
    },

    Escape (event) {
        this.setState({
            highlightedIndex: null,
            isOpen: false
        })
    }
}

var Typeahead = React.createClass({

    propTypes: {
        initialValue: React.PropTypes.any,
        onChange: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        shouldItemRender: React.PropTypes.func,
        renderItem: React.PropTypes.func.isRequired,
        menuStyle: React.PropTypes.object,
        inputProps: React.PropTypes.object
    },

    getDefaultProps () {
        return {
            inputProps: {},
            onChange () {
            },
            onSelect (value, item) {
            },
            renderMenu (items, value, style) {
                return <div style={_.extend({}, style, this.menuStyle)} children={items}/>
            },
            shouldItemRender () {
                return true
            },
            menuStyle: {
                borderRadius: '3px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '2px 0',
                fontSize: '90%',
                position: 'fixed',
                overflow: 'auto',
                maxHeight: '50%'
            }
        }
    },

    getInitialState () {
        return {
            value: this.props.initialValue || '',
            isOpen: false,
            highlightedIndex: null
        }
    },

    componentWillMount () {
        this._ignoreBlur = false
        this._performAutoCompleteOnUpdate = false
        this._performAutoCompleteOnKeyUp = false
    },

    componentWillReceiveProps () {
        this._performAutoCompleteOnUpdate = true
    },

    componentDidUpdate (prevProps, prevState) {
        if (this.state.isOpen === true && prevState.isOpen === false) {
            this.setMenuPositions()
        }

        if (this.state.isOpen && this._performAutoCompleteOnUpdate) {
            this._performAutoCompleteOnUpdate = false
            this.maybeAutoCompleteText()
        }

        this.maybeScrollItemIntoView()
    },

    maybeScrollItemIntoView () {
        if (this.state.isOpen === true && this.state.highlightedIndex !== null) {
            var itemNode = React.findDOMNode(this.refs[`item-${this.state.highlightedIndex}`])
            var menuNode = React.findDOMNode(this.refs.menu)
            scrollIntoView(itemNode, menuNode, {onlyScrollIfNeeded: true})
        }
    },

    handleKeyDown (event) {
        if (this.keyDownHandlers[event.key]) {
            this.keyDownHandlers[event.key].call(this, event)
        }
        else {
            this.setState({
                highlightedIndex: null,
                isOpen: true
            })
        }
    },

    handleChange (event) {
        this._performAutoCompleteOnKeyUp = true
        this.setState({
            value: event.target.value
        }, () => {
            this.props.onChange(event, this.state.value)
        })
    },

    handleKeyUp () {
        if (this._performAutoCompleteOnKeyUp) {
            this._performAutoCompleteOnKeyUp = false
            this.maybeAutoCompleteText()
        }
    },

    keyDownHandlers: {
        ArrowDown: HANDLERS['ArrowDown'],
        ArrowUp: HANDLERS['ArrowUp'],
        Enter: HANDLERS['Enter'](true),
        Tab: HANDLERS['Enter'](false),
        Escape: HANDLERS['Escape']
    },

    getFilteredItems () {
        var items = this.props.items

        if (this.props.shouldItemRender) {
            items = items.filter((item) => (
                this.props.shouldItemRender(item, this.state.value)
            ))
        }

        if (this.props.sortItems) {
            items.sort((a, b) => (
                this.props.sortItems(a, b, this.state.value)
            ))
        }

        return items
    },

    maybeAutoCompleteText () {
        if (this.state.value === '') {
            return
        }
        var { highlightedIndex } = this.state
        var items = this.getFilteredItems()
        if (items.length === 0) {
            return
        }
        var matchedItem = highlightedIndex !== null ?
            items[highlightedIndex] : items[0]
        var itemValue = this.props.getItemValue(matchedItem)
        var itemValueDoesMatch = (itemValue.toLowerCase().indexOf(
            this.state.value.toLowerCase()
        ) === 0)
        if (itemValueDoesMatch) {
            var node = React.findDOMNode(this.refs.input)
            var setSelection = () => {
                node.value = itemValue
                node.setSelectionRange(this.state.value.length, itemValue.length)
            }
            if (highlightedIndex === null) {
                this.setState({highlightedIndex: 0}, setSelection)
            }
            else {
                setSelection()
            }
        }
    },

    setMenuPositions () {
        var node = React.findDOMNode(this.refs.input)
        var rect = node.getBoundingClientRect()
        var computedStyle = getComputedStyle(node)
        var marginBottom = parseInt(computedStyle.marginBottom, 10)
        var marginLeft = parseInt(computedStyle.marginLeft, 10)
        var marginRight = parseInt(computedStyle.marginRight, 10)
        this.setState({
            menuTop: rect.bottom + marginBottom,
            menuLeft: rect.left + marginLeft,
            menuWidth: rect.width + marginLeft + marginRight
        })
    },

    highlightItemFromMouse (index) {
        this.setState({highlightedIndex: index})
    },

    selectItemFromMouse (item) {
        this.setState({
            value: this.props.getItemValue(item),
            isOpen: false,
            highlightedIndex: null
        }, () => {
            this.props.onSelect(this.state.value, item)
            React.findDOMNode(this.refs.input).focus()
            this.setIgnoreBlur(false)
        })
    },

    setIgnoreBlur (ignore) {
        this._ignoreBlur = ignore
    },

    renderMenu () {
        var items = this.getFilteredItems().map((item, index) => {
            var element = this.props.renderItem(
                item,
                this.state.highlightedIndex === index,
                {cursor: 'default'}
            )
            return React.cloneElement(element, {
                onMouseDown: () => this.setIgnoreBlur(true),
                onMouseEnter: () => this.highlightItemFromMouse(index),
                onClick: () => this.selectItemFromMouse(item),
                ref: `item-${index}`
            })
        })
        var style = {
            left: this.state.menuLeft,
            top: this.state.menuTop,
            minWidth: this.state.menuWidth
        }
        var menu = this.props.renderMenu(items, this.state.value, style)
        return React.cloneElement(menu, {ref: 'menu'})
    },

    handleInputBlur () {
        if (this._ignoreBlur) {
            return
        }
        this.setState({
            isOpen: false,
            highlightedIndex: null
        })
    },

    handleInputFocus () {
        if (this._ignoreBlur) {
            return
        }
        this.setState({isOpen: true})
    },

    handleInputClick () {
        if (this.state.isOpen === false) {
            this.setState({isOpen: true})
        }
    },

    render () {
        if (this.props.debug) { // you don't like it, you love it
            _debugStates.push({
                id: _debugStates.length,
                state: this.state
            })
        }
        return (
            <div className="form-group">
                <input
                    {...this.props.inputProps}
                    role="combobox"
                    aria-autocomplete="both"
                    ref="input"
                    onFocus={this.handleInputFocus}
                    onBlur={this.handleInputBlur}
                    onChange={(event) => this.handleChange(event)}
                    onKeyDown={(event) => this.handleKeyDown(event)}
                    onKeyUp={(event) => this.handleKeyUp(event)}
                    onClick={this.handleInputClick}
                    value={this.state.value}
                    />
                {this.state.isOpen && this.renderMenu()}
                {this.props.debug && (
                    <pre style={{marginLeft: 300}}>
            {JSON.stringify(_debugStates.slice(_debugStates.length - 5, _debugStates.length), null, 2)}
          </pre>
                )}
            </div>
        )
    }
})

module.exports = Typeahead
