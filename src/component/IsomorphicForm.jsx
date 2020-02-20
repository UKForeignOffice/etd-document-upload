'use strict';

var React = require('react')
var assign = require('react/lib/Object.assign')
var _ = require('lodash')
var SummaryErrors = require('./SummaryErrors')

var IsomorphicForm = React.createClass({
  contextTypes: {
      router: React.PropTypes.func.isRequired,
      isomorphic: React.PropTypes.object.isRequired
  },

  propTypes: {
    component: React.PropTypes.any,
    to: React.PropTypes.string,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    autoComplete: React.PropTypes.string,
    noValidate: React.PropTypes.string,
    onSubmit: React.PropTypes.func
  },

  getDefaultProps() {
    return {
        component: 'form',
        method: 'POST',
        ref: 'form',
        autoComplete: 'off'
    }
  },

  getInitialState() {
    return {
         client: false
    }
  },

  componentWillMount() {
    this.context.isomorphic.instanciateForm(this.props.form)
  },

  /**
   * Returns the value of the "action" attribute to use on the DOM element.
   */
  getAction() {
      return ""
  },

  getErrorMessages() {
    return _.flatten(
      _.map(this.context.isomorphic.getForm().errors().errors, function (error, key) {

          return _.map(error.data, function (validationError) {
            var errorMessage = validationError.message
            if (validationError.params !== null) {
              var paramVal = validationError.params.value
              var paramShow = validationError.params.showValue
              var paramLimit = validationError.params.limitValue

              if (validationError.params.limitValue !== null) {
                errorMessage = errorMessage.replace("{limitValue}", paramLimit)
              }
              if (validationError.params.showValue !== null) {
                errorMessage = errorMessage.replace("{showValue}", paramShow)
              }
              if (validationError.params.value !== null) {
                errorMessage = errorMessage.replace("{value}", paramVal)
              }
            }
           else {
              errorMessage = validationError.message
            }
            return {field: key, message: errorMessage}
          })
      })
    )
  },

  handleSubmitFactory(query) {
        var self = this;
        return function handleSubmit(e) {
            self.context.isomorphic.submit(e, self.refs.form, query)
        }
   },
  render() {
    var props = assign({}, this.props, {
        action: this.getAction(),
        onSubmit: this.handleSubmitFactory(this.props.query),
        noValidate: this.props.noValidate || this.state.client
    })

    var formElement = React.createElement(this.props.component, props,
        this.context.isomorphic.getForm().render(),
        this.props.children)

    return (
      <div>
        <SummaryErrors messages={this.getErrorMessages()} disabled={this.props.disableSummary}/>
        {formElement}
      </div>
    )
  }
})

module.exports = IsomorphicForm
