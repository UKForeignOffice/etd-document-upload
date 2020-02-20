'use strict';

var React = require('react')
var BackButton = require('../../component/BackButton')
var Global = require('../../component/Global')


var TermsAndConditionsPage = React.createClass({
    statics: {
        title: 'Terms and Conditions'
    },
    render() {
        var privacyPolicyLink = Global.getConfig().client.linkToPrivacyPolicy
        return (
          <div className="grid-row">
            <div className="column-two-thirds">

                <header>
                    <h1 className="heading-xlarge">Terms and conditions</h1>
                </header>

                <div>
                    <p>By using this digital service you agree to our <a href={privacyPolicyLink}>privacy policy</a> and to these terms and conditions. Read them carefully.</p>

                    <h1 className="heading-medium">Terms and conditions</h1>

                    <h2 className="font-medium">General</h2>

                    <p>These terms and conditions affect your rights and liabilities under the law. They
                        govern your use of, and relationship with, the service. They
                        don’t apply to other services provided by the Foreign &amp; Commonwealth Office, or
                        to any other department or service which is linked to in this service.</p>

                    <p>You agree to use this site only for lawful purposes, and in a manner that does not
                        infringe the rights of, or restrict or inhibit the use and enjoyment of, this site
                        by any third party.</p>

                    <p>We may occasionally update these terms and conditions. This might happen if there’s a
                        change in the law or to the way this service works. Check these terms and
                        conditions regularly, as continued use of the service after a
                        change has been made is your acceptance of the change. If you don't agree to the terms
                        and conditions and <a href={privacyPolicyLink}>privacy policy</a>, you should not use this service.</p>

                    <h2 className="font-medium">Applicable law</h2>

                    <p>Your use of this service and any dispute arising from its use will be governed by and
                        construed in accordance with the laws of England and Wales, including but not
                        limited to the:</p>

                    <ul className="list-bullet">
                        <li>Computer Misuse Act 1990</li>
                        <li>Data Protection Act</li>
                        <li>Mental Capacity Act 2005</li>
                    </ul>

                    <h2 className="font-medium">How to use this service responsibly</h2>

                    <p>You must provide us with enough information for us to assess the case fairly and if appropriate to provide the service.

                        We also need these details to provide information about the appointment, including
                        rescheduling and cancellation when necessary, so you must provide accurate details
                        where we can reliably contact you.</p>

                    <p>When attending their appointment the person requiring an emergency travel document will have to pass through
                        Security checks. They should expect their belongings to be checked, and will
                        have to leave their mobile phone and other belongings with the Security Officer.
                        Do not bring laptops or other electronic devices. Arrive in advance of
                        the appointment. If you need to cancel or modify your booking, you will be able to
                        do so by following the link in the confirmation email.</p>

                    <p>There are risks in using a shared computer, such as in an internet caf&eacute;, to use this
                        digital service. It’s your responsibility to be aware of these risks and to avoid
                        using any computer which may leave your personal information accessible to others.
                        You are responsible if you choose to leave a computer unprotected while in the process of using the service.</p>

                    <p>We make every effort to check and test this service whenever we amend or update it.
                        However, you must take your own precautions to ensure that the way you access this
                        service does not expose you to the risk of viruses, malicious computer code or other
                        forms of interference which may damage your own computer system.</p>

                    <p>You must not misuse our service by knowingly introducing viruses, trojans, worms,
                        logic bombs or other material which is malicious or technologically harmful. You
                        must not attempt to gain unauthorised access to our service, the system on which our
                        service is stored or any server, computer or database connected to our service. You
                        must not attack our site via a denial-of-service attack or a distributed
                        denial-of-service attack.</p>

                    <h1 className="heading-medium">Disclaimer</h1>

                    <p>While we make every effort to keep this service up to date, we don’t provide any
                        guarantees, conditions or warranties as to the accuracy of the information on the
                        site.</p>

                    <p>While Consular staff will give you as much advice as they can, it is your
                        responsibility to ensure that you are obtaining the correct service and that you
                        bring all the necessary documentation for the service. If you are unsure, you may
                        wish to take legal advice before booking the service. </p>

                    <p>Our consular fees are not refundable, and are subject to change without notice. Check
                        the relevant <a href="https://www.gov.uk/search?q=consular+fees" target="_blank">consular
                            fees list</a> for the latest information.</p>

                    <p>We don’t accept liability for loss or damage incurred by users of this service, whether direct,
                        indirect or consequential, whether caused by tort, breach of contract or otherwise.
                        This includes loss of income or revenue, business, profits or contracts, anticipated savings,
                        data, goodwill, tangible property or wasted time in connection with this service or any websites
                        linked to it and any materials posted on it. This condition shall not prevent claims for loss of
                        or damage to your tangible property or any other claims for direct financial loss that are not
                        excluded by any of the categories set out above.</p>

                    <p>This does not affect our liability for death or personal injury arising from our negligence,
                        nor our liability for fraudulent misrepresentation or misrepresentation as to a fundamental matter,
                        nor any other liability which cannot be excluded or limited under applicable law.  </p>

                    <h2 className="font-medium">Information provided by this service</h2>

                    <p> We work hard to ensure that information within this service is accurate.
                        However, we can’t guarantee the accuracy and completeness of any information at all times.
                        While we make every effort to ensure this service is accessible at all times,
                        we are not liable if it is unavailable for any period of time. </p>


                </div>
            </div>
          </div>

        )
    }
})

module.exports = TermsAndConditionsPage