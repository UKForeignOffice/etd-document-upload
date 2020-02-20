'use strict';

var React = require('react')

var PhaseBanner = React.createClass({
    render() {
        return <div className = "phase-banner-beta">
            <p>
                <strong className = "phase-tag">BETA</strong>
                <span>This is a new service – your&nbsp;<a href="http://www.smartsurvey.co.uk/s/etd-online/" target="_blank">feedback</a>&nbsp;will help us to improve it.</span>
            </p>
        </div>
    }
})

module.exports = PhaseBanner


