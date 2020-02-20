'use strict';

var React = require('react')
var titleText = "Link not available"
var PiwikEvent = require('../../utils/PiwikEvent')
var TasklistLinkErrorPage = React.createClass({
    statics: {
        title: titleText
    },
    render() {
        PiwikEvent.fire("ERR-4.Tasklist Link Error has occurred", 'Y')

        return (
            <div className="grid-row">
                <div className="column-two-thirds">
                    <h1 className="heading-large">
                        {titleText}
                    </h1>
                    <p>
                        The link you have followed is not valid, or has expired. <a href="https://www.gov.uk/government/world/embassies">Contact your nearest
                        British consulate</a> for advice on how to provide your photograph and supporting documents.
                        You will need your reference number, which is provided in your confirmation email.
                    </p>
                </div>
            </div>
        )
    }
})

module.exports = TasklistLinkErrorPage
