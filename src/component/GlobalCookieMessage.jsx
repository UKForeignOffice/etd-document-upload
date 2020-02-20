'use strict';

var React = require('react')

var GlobalCookieMessage = React.createClass({
  render() {
    return <div id="global-cookie-message">
    <div className="outer-block">
        <div className="inner-block">
            <p>This service uses cookies, including one which is required to complete an online application. <a href ="/cookies" target="_blank">Review your cookie settings.</a></p>
        </div>
    </div>
</div>
  }
})

module.exports = GlobalCookieMessage


