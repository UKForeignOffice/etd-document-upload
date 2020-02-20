'use strict';

var React = require('react');
var titleText = 'Link has expired';
var PiwikEvent = require('../../utils/PiwikEvent');
var TasklistLinkExpiredPage = React.createClass({
  statics: {
    title: titleText
  },
  render() {
    PiwikEvent.fire('ERR-4.Tasklist Link Expired Error has occurred', 'Y');

    return (
      <div className="grid-row">
        <div className="column-two-thirds">
          <h1 className="heading-large">
            {titleText}
          </h1>
          <p>
            The link that you are trying to use has expired. <a href="https://www.gov.uk/government/world/embassies">Contact the post</a> that sent you this link in an email and they will assist you.
          </p>
        </div>
      </div>
    );
  }
});

module.exports = TasklistLinkExpiredPage;
