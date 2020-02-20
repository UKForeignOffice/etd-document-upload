'use strict';

var React = require('react')
var titleText = "An error has occurred"
var PiwikEvent = require('../../utils/PiwikEvent')
var logger = require('../../utils/logs/logger').getLogger('GenericError')

var GenericErrorPage = React.createClass({
    statics: {
        title: titleText
    },
    render() {
        logger.info("Generic Error page info", this.props)
        PiwikEvent.fire("ERR-1.Generic Error has occurred", 'Y')

        return (
            <div className="grid-row">
                <div className="column-two-thirds">
                    <h1 className="heading-large">
                    {titleText}
                    </h1>
                    <p>We are experiencing technical problems.</p>
                    <p>Try to <a href="javascript:history.back(1);">go back and try again</a>. 
                    If this doesn't work try the browser back button or try again shortly.</p>
                    <p>Check if you’ve received an email from us.</p>
                    <h2 className="heading-small">You’ve received an email</h2>
                    <p>We have received your application details. Follow the instructions in 
                    the email to complete your application.</p>
                    <h2 className="heading-small">You’ve not received an email</h2>
                    <p>If you have not received an email, unfortunately any data you’ve entered 
                    might be lost. If you require urgent assistance, please <a href="https://www.gov.uk/government/world/embassies">contact your nearest 
                    British consulate</a> so that we can help you or <a href="/">apply for an emergency travel document again</a>.</p>
                </div>
            </div>            
        )
    }
})

module.exports = GenericErrorPage