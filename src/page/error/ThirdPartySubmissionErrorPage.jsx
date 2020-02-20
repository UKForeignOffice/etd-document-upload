'use strict';

var React = require('react')

var SessionTimeoutErrorPage = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    statics: {
        title: 'An error has occurred'
    },
    render() {
        return (
          <div className="grid-row">
            <div className="column-two-thirds">
                <h2 className="heading-large">An error has occurred</h2>

                <p>Unfortunately our system to invite a friend to pay is having some technical problems.
                Returns to the payment options page where you can try again. If you continue to see this message,
                select 'Pay at the consulate' to continue. You will need to make arrangements to pay at the consulate
                when you arrive.</p>

                <a href="/payment-options" className="button">Try again</a>
            </div>
          </div>
        )
    }
})

module.exports = SessionTimeoutErrorPage