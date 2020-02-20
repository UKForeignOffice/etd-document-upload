'use strict';

var React = require('react')
var PiwikEvent = require('../../utils/PiwikEvent')


var SessionTimeoutErrorPage = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    statics: {
        title: 'Your session has expired'
    },
    render() {
        var { url } = this.context.router.getCurrentQuery()

        var home = '/'
        var action = 'apply'
        if (url) {
            switch (url) {
                case (url.match(/^\/third-party-payment/) || {}).input:
                    home = '/third-party-payment'
                    action = 'pay'
                    break
            }
        }
        PiwikEvent.fire("ERR-2.Timeout Error", "Y")  //appeared at ", url)
        return (
          <div className="grid-row">
            <div className="column-two-thirds">

                <h2 className="heading-large">Your application has timed out</h2>
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

module.exports = SessionTimeoutErrorPage
