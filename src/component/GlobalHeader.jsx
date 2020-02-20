'use strict';

var React = require('react')

var GlobalHeader = React.createClass({
  render() {
    return <header role="banner" id="global-header" className="with-proposition">
      <div className="header-wrapper">
        <div className="header-global">
          <div className="header-logo">
            <a className="content" href="https://www.gov.uk" title="Go to the gov.uk homepage" id="logo">
              <img src="/govuk/img/gov.uk_logotype_crown.png" width="35" height="31" alt="" /> GOV.UK
            </a>
          </div>
        </div>
        <div className="header-proposition">
          <div className="content">
            <nav id="proposition-menu">
              <a href="https://www.gov.uk/emergency-travel-document" id="proposition-name">Apply for an emergency travel document</a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  }
})

module.exports = GlobalHeader


