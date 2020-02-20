'use strict';

var React = require('react')
var PiwikEvent = require('../../utils/PiwikEvent')
var SessionTimeoutErrorPage = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    statics: {
        title: 'An error has occurred'
    },
    render() {
        PiwikEvent.fire("ERR-3.A Submission error has occurred", 'Y')

        var { casebookReference, etdOnlineReference, postLabel, paymentStatus } = this.context.router.getCurrentQuery()

        var casebookFailedSection
        var casebookSuccessfulSection
        if (casebookReference) {
            casebookSuccessfulSection = <div id='casebook-successful-section'>
                <p>Your application has been submitted and has reference {etdOnlineReference} but
                there has been a problem generating your application form. </p>
                    <p>Download your application, print it and take
                it to the {postLabel} consulate.</p></div>
        } else {
            casebookFailedSection = <div id='casebook-failed-section'>
                <p>There has been an error and we have been unable to submit your application. Your application has reference {etdOnlineReference}.</p>
                    <p>Download your application, print it and take it to the {postLabel} consulate.</p></div>
        }

        var paymenSection
        if (paymentStatus === 'AUTHORISED') {
            paymenSection = <div id='payment-section'>
                <p>No payment will be taken from you unless we go on to issue with an emergency travel
                document.</p></div>
        }

        return (
          <div className="grid-row">
            <div className="column-two-thirds">

                <h2 className="heading-large">An error has occurred</h2>

                {casebookSuccessfulSection}
                {casebookFailedSection}
                {paymenSection}

                <p><a href='/pdf/generation' className='button secondary' target='_blank'>Print</a></p>
                <p>Opens a printable version of your application in a new tab.</p>
            </div>
          </div>
        )
    }
})

module.exports = SessionTimeoutErrorPage