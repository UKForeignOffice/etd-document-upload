'use strict';

var React = require('react')
var BackButton = require('../../component/BackButton')
var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var {IsomorphicFormMixIn} = require('../../component/IsomorphicFormMixIn')
var pageTitle = "Document added successfully"
var _ = require('lodash')
var UploadInfo = require('../../component/UploadInfo')


var DocumentSuccessPage = React.createClass({
    mixins: [IsomorphicFormMixIn],
    statics: {
        title: pageTitle,
    },

    showSuccessText: function (docLabel) {
        return (<p>Your {docLabel} has been submitted and can’t be changed. We will manually check your {docLabel}. If something isn’t right we will contact you to ask for a new one.</p>)
    },

    showTitleText: function (docLabel, reference, firstName)
    {
            return(
                <div className="govuk-box-highlight">
                    <p className="heading-large">
                        You have successfully uploaded your {docLabel}
                    </p>
                    {this.referenceText(reference)}
                    <p>{firstName}</p>
                </div>
            )

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
                        <p>If you have any further documents that you still need to add, you can return within 5 days using the link in the email we’ve sent you. Not doing so will delay your application.</p>
                    </span>
                </div>
            </div>)
        } else {
            return (
            <div>
                <a className="button" href="/">Next</a>
            </div>)
        }
    },

    render() {
        var sessionData = new IsomorphicFormDataHolder(this.props.data).getSessionData()

        var singleUseLink = (_.get(sessionData, 'UploadData.fromLink') && _.get(sessionData, 'UploadData.fromLink') === 'Y')
        var reference = _.get(sessionData, 'UploadData.reference')
        var firstName = _.get(sessionData, 'UploadData.firstName')
        var docType = _.get(sessionData, 'DocumentUploadForm.documentType')
        var docLabel = ""

        if(docType === "PROOF_OF_TRAVEL")
        {
            docLabel = "copy of your travel booking"
        }
        else if(docType === "PROOF_OF_PASSPORT")
        {
            docLabel = "photo of your passport"
        }

        else if(docType === "PROOF_OF_RESIDENCE")
        {
            docLabel = "proof of residency"
        }
        else if(docType === "PROOF_OF_HONG_KONG_ID")
        {
            docLabel = "proof of Hong Kong ID card"
        }
        else {
            docLabel = "document"
        }

        return (
            <div className="grid-row">

                <div className="column-two-thirds">
                    {this.showTitleText(docLabel, reference, firstName)}

                    {this.showSuccessText(docLabel)}

                    {this.showNextText(singleUseLink)}
                </div>

            </div>
        )
    }
})

module.exports = DocumentSuccessPage
