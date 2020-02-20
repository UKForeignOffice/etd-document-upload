'use strict';

var React = require('react')
var Global = require('./Global')
var GlobalFooter = React.createClass({
  render() {

      var surveyLink = Global.getConfig().client.linkToSurvey
      var privacyPolicyLink = Global.getConfig().client.linkToPrivacyPolicy
    return <footer className="group js-footer" id="footer" role="contentinfo">

    <div className="footer-wrapper">
        { /* footerTop */ }

        <div className="footer-meta">
            <div className="footer-meta-inner">
                <ul>
                    <li><a href={surveyLink} target="_blank">Feedback</a></li>
                    <li><a href="/cookies" target="_blank">Cookies</a></li>
                    <li><a href={privacyPolicyLink} target="_blank">Privacy Policy</a></li>
                    <li><a href="/terms-and-conditions" target="_blank">Terms and conditions</a></li>
                </ul>

                <div className="open-government-licence">
                    <p className="logo"><a target="_blank" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence</a></p>
                    <p>All content is available under the <a target="_blank" href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" rel="license">Open Government Licence v3.0</a>, except where otherwise stated</p>
                </div>
            </div>

            <div className="copyright">
                <a target="_blank" href="https://www.nationalarchives.gov.uk/information-management/our-services/crown-copyright.htm">&copy; Crown copyright</a>
            </div>
        </div>
    </div>
</footer>
  }
})

module.exports = GlobalFooter


