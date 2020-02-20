'use strict';

var React = require('react')

var BackButton = React.createClass({

    propTypes: {
        numSteps: React.PropTypes.number,
        routeName: React.PropTypes.string
    },

    render() {
        var href
        if (this.props.routeName) {
            href = "/" + this.props.routeName
        } else if (this.props.numSteps) {
            href = "javascript:history.back(" + this.props.numSteps + ");"
        } else {
            href = "javascript:history.back(1);"
        }

        return <div className = "backButton">
          <img src="/img/icon-backbutton.svg" alt='Return to the previous page' /><a href={href}>Back</a>
        </div>
    }
})

module.exports = BackButton


