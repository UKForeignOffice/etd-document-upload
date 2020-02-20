'use strict';

var React = require('react')
var Global = require('../../component/Global')

var piwikOptOutUrl = Global.getConfig().client.piwik.optOutUrl
var CookiePolicyPage = React.createClass({
    statics: {
        title: 'Cookie policy'
    },
    render() {
        return (
          <div className="grid-row">
            <div className="column-two-thirds">

                <br />
                <p>For information on what Cookies are and how they are used on GOV.UK pages, go to <a target="_blank" href="https://www.gov.uk/help/cookies">GOV.UK</a></p>

                <h1 className="heading-large">How cookies are used on emergency travel document applications</h1>
                <h3 className="heading-small">Measuring website usage (Matomo)</h3>

                <p>We use Matomo Analytics software to collect non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. We do this to better understand how applicants for emergency travel documents use the website. From time to time, the Foreign and Commonwealth Office may release non-personally-identifying information in the aggregate, eg, by publishing a report on trends in the usage of its website.</p>
                <span>Matomo Analytics sets the following cookies for these purposes</span>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Purpose</th>
                        <th>Expires</th>
                    </tr>
                    <tr>
                        <td>_pk_ref</td>
                        <td>web-analytics.fco.gov.uk</td>
                        <td>Two years</td>
                    </tr>
                    <tr>
                        <td>_pk_cvar</td>
                        <td>web-analytics.fco.gov.uk</td>
                        <td>Two years</td>
                    </tr>
                    <tr>
                        <td>_pk_id</td>
                        <td>web-analytics.fco.gov.uk</td>
                        <td>Two years</td>
                    </tr>
                    <tr>
                        <td>_pk_ses</td>
                        <td>web-analytics.fco.gov.uk</td>
                        <td>Two years</td>
                    </tr>
                </table>
                <br />
                <p>You can <a href={piwikOptOutUrl} target="_blank">opt out from Matomo Analytics cookies</a>.
                    If you are using an unsupported browser, such as Internet Explorer 6 on Windows Vista,
                    we do not track your web site usage and the opt out page above will not be displayed.</p>

                <h3 className="heading-small">Your progress when applying for an emergency travel document</h3>
                <p>When you apply for an emergency travel document we set a cookie. An online application can’t be
                    completed without it, so this cookie is necessary in order to perform our official functions as
                    a government department. The cookie remembers your progress through the forms and will also
                    remember the data you've entered. Once you submit your application the cookie will be cleared.
                    The cookie will also be deleted if there is a 20 minute period of inactivity.</p>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Purpose</th>
                        <th>Expires</th>
                    </tr>
                    <tr>
                        <td>accessToken</td>
                        <td>Session ID assigned to identify a specific user&rsquo;s data</td>
                        <td>At the end of the session</td>
                    </tr>
                </table>
                <br />

                <h3 className="heading-small">Introductory cookie message</h3>
                <p>When you first use the service we show a ‘cookie message’.
                    We then store a cookie on your computer so it knows not to show this message again.</p>

                <table>
                    <tr>
                        <th>Name</th>
                        <th>Purpose</th>
                        <th>Expires</th>
                    </tr>
                    <tr>
                        <td>seen_cookie_message</td>
                        <td>Lets us know you&rsquo;ve already seen our cookie message</td>
                        <td>28 days</td>
                    </tr>
                </table>
                <br />
                
                <p>We use other suppliers to provide this service</p>
                <ul className="list-bullet">
                    <li><a href="http://www.bookingbug.com/" target="_blank">BookingBug</a> to provide the availability schedule and manage bookings.
                        See the <a href="http://uk.bookingbug.com/docs/termsandconditions.html" target="_blank">BookingBug terms &amp; conditions</a>
                        &nbsp;and <a href="http://uk.bookingbug.com/docs/privacy.html" target="_blank">BookingBug privacy policy</a> attached to this service.</li>
                    <li>Barclays provide the online payment service. If you choose to pay online, read <a target="_blank" href="http://www.barclays.co.uk/ImportantInformation/Cookiespolicy/P1242558101760">Barclays cookie policy</a>.</li>
                </ul>
            </div>
          </div>
        )
    }
})

module.exports = CookiePolicyPage