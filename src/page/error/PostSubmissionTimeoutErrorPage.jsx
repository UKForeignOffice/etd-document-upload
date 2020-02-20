'use strict';

var React = require('react')

var PostSubmissionTimeoutErrorPage = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    statics: {
        title: 'Your session has expired'
    },
    render() {
        return (
          <div className="grid-row">
            <div className="column-two-thirds">
                <h2 className="heading-large">Your application has timed out</h2>
                <p>You can no longer edit your personal details. If you need to update or amend your application, contact <a target="_blank" href="https://www.gov.uk/government/world/embassies">your nearest
                    British consulate</a> for help and advice.</p>
            </div>
          </div>
        )
    }
})

module.exports = PostSubmissionTimeoutErrorPage
