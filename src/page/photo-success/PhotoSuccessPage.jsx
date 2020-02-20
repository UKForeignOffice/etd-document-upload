'use strict';

var React = require('react')
var BackButton = require('../../component/BackButton')
var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var {IsomorphicFormMixIn} = require('../../component/IsomorphicFormMixIn')
var pageTitle = "Photo added successfully"
var _ = require('lodash')

var PhotoSuccessPage = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: pageTitle,
    },

    showSuccessText: function () {
        return (
            <p>Your photo has been submitted and can't be changed. We will manually check your photo. If something isn't
                right we will contact you to ask for a new one.</p>)
    },
    referenceText: function (reference) {
        if (reference) {
            return (
                    <div className="font-medium"> Application reference:
                        <div className="bold-medium">{reference}</div>
                    </div>
                )
            }

    },

    showNextText: function (singleUseLink) {
        if (singleUseLink) {
            return (
                <div>
                    <div className="help-notice clear-float">
                    <span className="heading-small">
                        <p>If you have any further documents that you still need to add, use the link that we have emailed you. Not doing so will delay your application.</p>
                    </span>
                    </div>
                </div>)
        } else {
            return (
                <div>
                    <a className="button" href="task-list">Next</a>
                </div>
            )
        }
    },

    render() {
        var sessionData = new IsomorphicFormDataHolder(this.props.data).getSessionData()

        var singleUseLink = (_.get(sessionData, 'UploadData.fromLink') && _.get(sessionData, 'UploadData.fromLink') === 'Y')
        var reference = _.get(sessionData, 'UploadData.reference')
        var firstName = _.get(sessionData, 'UploadData.firstName')
        return (
            <div className="grid-row">

                <div className="column-two-thirds">


                    <div className="govuk-box-highlight">
                        <p className="heading-large">
                            You have successfully uploaded your photo
                        </p>
                        {this.referenceText(reference)}
                        <p>{firstName}</p>
                    </div>
                    <br/>
                    {this.showSuccessText()}
                    <br/>
                    {this.showNextText(singleUseLink)}
                </div>

            </div>

        )
    }
})

module.exports = PhotoSuccessPage
