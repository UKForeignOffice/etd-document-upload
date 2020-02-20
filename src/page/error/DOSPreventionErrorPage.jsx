'use strict';

var React = require('react')
var DOSPreventionErrorPage = React.createClass({
    render() {
        return (
          <div className="grid-row">
          <div className="column-two-thirds">
                <h1 className="heading-large">
                    Unusual activity detected
                </h1>

                <p>
                    It is not possible to submit your application as we have detected unusual activity.
                </p>

                <p>
                    Return to your application and attempt to submit it again.
                </p>
            </div>
          </div>
        )
    }
})

module.exports = DOSPreventionErrorPage