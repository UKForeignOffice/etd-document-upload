'use strict'

var React = require('react')
var {Navigation} = require('@insin/react-router')
var RestClientPromise = require('superagent-bluebird-promise')
var Global = require('./Global')
var logger = require('../utils/logs/logger').getLogger('TimeoutWarning')

var timeout = (Global.getConfig().client.sessionTimeout - Global.getConfig().client.sessionTimeoutWarningDelay)

var TimeoutWarning = React.createClass({
    mixins: [Navigation],

    propTypes: {
        resetTimeoutWarning: React.PropTypes.func,
        amountOfWarningTime: React.PropTypes.number
    },

    getInitialState() {
        return {
            secondsLeft: timeout
        }
    },

    secondsToTime(secs) {
        // Never show negative times (shouldn't happen anyway due to redirect!)
        if (secs === 0) {
            return {
                m: 0,
                s: 0
            }
        }
        var mins = Math.floor(secs / 60)
        return {
            m: mins,
            s: secs - (mins * 60)
        }
    },

    componentDidMount() {
        this.countdownTimer = setInterval(this.countDown, 1000)
    },

    componentWillUnmount() {
        clearInterval(this.countdownTimer)
    },

    countDown() {
        this.setState({secondsLeft: this.state.secondsLeft - 1})

        if (this.state.secondsLeft === 0) {
            clearInterval(this.countdownTimer)
            window.location = this.makeHref('session-timeout')
        }
    },

    refreshSession(e) {
        var self = this
        RestClientPromise.get(Global.getSessionApiBaseUrl(Global.getCookie('accessToken')) + '/form').then(
            function () {
                logger.debug("user refreshed session")
                clearInterval(self.countdownTimer)
                self.props.resetTimeoutWarning()
            },
            function (err) {
                logger.error("error refreshing session", err)
                clearInterval(self.countdownTimer)
                window.location = this.makeHref('session-timeout')
            }
        ).done()
        e.preventDefault()
    },

    render() {
        var time = this.secondsToTime(this.state.secondsLeft)

        return <div className='modal-container'>
            <div className='modal-content-area'>
                <h1 className='heading-large'>
                    Your application will time out soon
                </h1>
                <p>We will reset your application if you do not respond in</p>
                <p><img className='countdown-clock' src='/img/icon-countdown-clock.png' alt='Countdown clock'/><span
                    className='countdown'>{time.m}</span>min<span className='hide-small'>ute</span>s
                    <span className='countdown' style={{'color': '#111'}}>{time.s}</span>seconds.
                </p>
                <p>We do this to keep your information secure.</p>
                <p><a onClick={function (e) {
                    this.refreshSession(e)
                }.bind(this)} href="" className="button">Continue application</a></p>
            </div>
        </div>
    }
})

module.exports = TimeoutWarning


