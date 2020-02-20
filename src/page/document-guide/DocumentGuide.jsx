'use strict'

var React = require('react')
var BackButton = require('../../component/BackButton')
var {Navigation} = require('@insin/react-router')

var PhotoGuideDoc = React.createClass({
    mixins: [Navigation],
    statics: {
        title: 'PhotoGuideDoc'
    },

    render() {

        return (
            <div className="grid-row">
                <div className="column-third add-title-margin note">
                    <p><img src="/img/photoguide/photodocument.jpg" alt="Document upload image"/></p>
                </div>

                <div className="column-two-thirds">
                    <BackButton />
<h1 className="heading-large">
                        How to photograph your document
                    </h1>
                    <ul className="list-bullet">
                        <li>Lay it flat on a table or for better results against a wall.</li>
                        <li>Make sure your address is readable.</li>
                        <li>No flash if possible.</li>
                        <li>Position the phone parallel to the document.</li>
                        <li>Use both hands to keep your phone steady.</li>
                    </ul>
                </div>
            </div>
        )
    }

})

module.exports = PhotoGuideDoc
