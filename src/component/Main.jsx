'use strict';

var React = require('react')
var TimerMixin = require('react-timer-mixin');
var {RouteHandler} = require('@insin/react-router')

var Global = require('./Global')

var GlobalCookieMessage = require('./GlobalCookieMessage')
var GlobalHeader = require('./GlobalHeader')
var GlobalHeaderBar = require('./GlobalHeaderBar')
var GlobalFooter = require('./GlobalFooter')
var GlobalError = require('./GlobalError')
var PhaseBanner = require('./PhaseBanner')
var TimeoutWarning = require('./TimeoutWarning')

var App = React.createClass({
  mixins: [TimerMixin],

  statics: {
    title: Global.getConfig().title
  },

  getInitialState() {
    return {
      server: true,
      showTimeOutWarning: false
    }
  },

  componentDidMount() {
    this.setState({server: false})
  },

  componentDidUpdate() {
      clearTimeout(this.timeoutWarning)
      this.timeoutWarning = setTimeout(function() {this.setState({showTimeOutWarning: true})}.bind(this), (Global.getConfig().client.sessionTimeoutWarningDelay * 1000))
  },

  displayTimeoutWarning() {
      if (this.state.showTimeOutWarning && this.props.data) {
          return <TimeoutWarning resetTimeoutWarning={this.resetTimeoutWarning} />
      }
  },

  resetTimeoutWarning() {
      this.setState({showTimeOutWarning: false})
      clearTimeout(this.timeoutWarning)
      this.timeoutWarning = setTimeout(function() {this.setState({showTimeOutWarning: true})}.bind(this), (Global.getConfig().client.sessionTimeoutWarningDelay * 1000))
  },

  render() {
    return <main id="main">
    <div id="skiplink-container">
        <div>
            <a href="#content" className="skiplink">Skip to main content</a>
        </div>
    </div>

    <GlobalCookieMessage />
    <GlobalHeader />
    <GlobalHeaderBar />
    <div id="content" role="main">
        <PhaseBanner />
        <div>
            {this.displayTimeoutWarning()}
          <RouteHandler {...this.props} />
        </div>
    </div>
    <GlobalFooter />
    <GlobalError />
  </main>
  }
})

module.exports = App
