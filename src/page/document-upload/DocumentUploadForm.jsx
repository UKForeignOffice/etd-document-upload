'use strict'

var React = require('react')
var _ = require('lodash')
var forms = require('newforms')
var ChoiceField = require('../../component/field/ChoiceField')
var CheckboxSelectMultipleWidget = require('../../component/widget/CheckboxSelectMultipleWidget')
var DocumentUploadAuxiliaryData = require('./DocumentUploadAuxiliaryData')
var Render = require('../../component/render/Render')
var PiwikEvent = require('../../utils/PiwikEvent')
var RestClient = require('../../utils/RestClient')
var Global = require('../../component/Global')
var env = require('../../utils/env')
var tasklistUtils = require('../../utils/tasklistUtils')
var logger = require('../../utils/logs/logger').getLogger('DocumentUploadForm')

//var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
//var UploadInfo = require('../../component/UploadInfo')

var generateErrorMessage = function (code) {
    switch (code) {
        case 'file-type-not-permitted':
            return 'The type of file you are adding is not permitted. Valid file formats include .pdf, .jpg, .png'
        case 'max-combined-size-exceeded':
            return 'The total size of the files that you are adding is too big. Make sure the collection of files that you upload are no more than 20 Megabytes'
        case 'max-single-size-exceeded':
            return 'The size of one of the files that you are adding is too big. Make sure the each file that you upload is no more than 10 Megabytes'
        case 'file-checks-error':
            return 'The file you uploaded did not pass our integrity checks, try another file'
        case 'file-checks-failed':
            return 'The file that you are trying to add did not pass our virus checks. You will need to provide us with another photo'
        case 'session-not-found':
        case 'missing-task':
        case 'invalid-task':
            return 'Your session has timed out. Check your email for a link to resume your application'
        default:
            logger.info("Document Upload form  Untransformed error-code: ", code)
            return 'An error has occurred. We are experiencing technical problems and are unable to process your document. Use your browsers back button to try again. If this doesn’t work try again shortly'
    }
}

var userInfo = {
    etdOnlineRef: null,
    casebookRef: null,
    firstName: null,
    lastName: null,
    tasklistReference: null,
    assetType: null
}

var validMimeTypes = [
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "application/pdf"
]

var taskNameHead = 'document'

var DocumentUploadForm = forms.Form.extend({

    constructor: function (kwargs) {
        forms.Form.call(this, kwargs)

        this.fromLink = _.get(kwargs, 'sessionData.UploadData.fromLink')
        //
        // if (_.get(kwargs, 'sessionData.stashedSessionData.CasebookForm.etdOnlineReference')) {
        //     userInfo.etdOnlineRef = _.get(kwargs, 'sessionData.stashedSessionData.CasebookForm.etdOnlineReference')
        // } else {
        //     if (_.get(kwargs, 'sessionData.UploadData.referenceType') === 'ETDONLINE') {
        //         userInfo.etdOnlineRef = _.get(kwargs, 'sessionData.UploadData.reference')
        //     }
        // }
        // if (_.get(kwargs, 'sessionData.stashedSessionData.CasebookForm.casebookReference')) {
        //     userInfo.casebookRef = _.get(kwargs, 'sessionData.stashedSessionData.CasebookForm.casebookReference')
        // } else {
        //     if (_.get(kwargs, 'sessionData.UploadData.referenceType') === 'CASEBOOK') {
        //         userInfo.casebookRef = _.get(kwargs, 'sessionData.UploadData.reference')
        //     }
        // }
        // if (_.get(kwargs, 'sessionData.stashedSessionData.NameForm.applicantFirstName')) {
        //     userInfo.firstName = _.get(kwargs, 'sessionData.stashedSessionData.NameForm.applicantFirstName')
        // } else {
        //     userInfo.firstName = _.get(kwargs, 'sessionData.UploadData.firstName')
        // }
        // if (_.get(kwargs, 'sessionData.stashedSessionData.NameForm.applicantLastName')) {
        //     userInfo.lastName = _.get(kwargs, 'sessionData.stashedSessionData.NameForm.applicantLastName')
        // }
        // userInfo.tasklistReference = _.get(kwargs, 'sessionData.UploadData.tasklistReference')

        //this.fields.howSupplyingDocuments.setChoices(['Y'])
    },

    documents: forms.MultipleFileField({
        label: 'Choose file or photo',
        required: false,
        maxSize: '20MB',
        accept: ['pdf', 'jpg', 'jpeg', 'png', 'gif'],
        helpText: "This opens your files to choose from."
    }),

    howSupplyingDocuments: ChoiceField({
        validation: {on: 'change'},
        label: "",
        required: false,
        helpText: "",
        choices: "Y",
        widget: CheckboxSelectMultipleWidget,
        errorMessages: {required: "Tell us how you will supply your document(s)"}
    }),

    docConfirmation: ChoiceField({
        choices: [["Y", "I confirm this is my/the applicant\'s" + " " + taskNameHead]],
        label: "",
        required: false,
        helpText: "",
        widget: CheckboxSelectMultipleWidget,
        errorMessages: {required: "Confirm that this is your/the applicant\'s document"}
    }),

    cleanDocConfirmation(callback) {
        if (this.cleanedData.docConfirmation) {
            PiwikEvent.fire("Confirmed that this is the applicants document. ", this.cleanedData.docConfirmation)
        }
        callback(null)
    },

    clean(callback) {
        if (env.CLIENT) {
            if (this.cleanedData.howSupplyingDocuments !== 'Y') {
                var formErrors = false
                if (!this.cleanedData.documents || this.cleanedData.documents.length === 0) {
                    this.addError('documents', 'You must select a file or photo to upload')
                    formErrors = true
                    return
                }
                if (!this.cleanedData.docConfirmation || this.cleanedData.docConfirmation !== 'Y') {
                    this.addError('docConfirmation', 'Confirm that this is your/the applicant\'s document')
                    formErrors = true
                }
                // if (!this.cleanedData.documentType) {
                //     this.addError('documentType', 'Unknown document type')
                //     formErrors = false
                // }

                // Check file sizes within limits on client before attempting to send
                var sizeCount = 0
                var maxSingleDocumentSize = Global.getMaxSingleDocumentSize()
                var maxCombinedDocumentSize = Global.getMaxCombinedDocumentSize()
                for (var i = 0; i < this.cleanedData.documents.length; i++) {
                    if (this.cleanedData.documents[i].size > maxSingleDocumentSize) {
                        this.addError('documents', generateErrorMessage('max-single-size-exceeded'))
                        formErrors = true
                        break
                    }
                    sizeCount += this.cleanedData.documents[i].size

                    if (!_.includes(validMimeTypes, this.cleanedData.documents[i].type)) {
                        this.addError('documents', generateErrorMessage('file-type-not-permitted'))
                        formErrors = true
                        break
                    }
                }

                if (sizeCount > maxCombinedDocumentSize) {
                    this.addError('documents', generateErrorMessage('max-combined-size-exceeded'))
                    formErrors = true
                }

                if (formErrors) {
                    return
                }

                var documentUploadPromise = RestClient()
                    .post(Global.getDocumentUploadUrl())

                _.forEach(this.cleanedData.documents, function (document) {
                    documentUploadPromise.attach('documents', document)
                })
                documentUploadPromise
                    .query({'type': 'DOCUMENT'})
                    .end((err, res) => {
                        if (err || res.serverError || res.clientError || ['ok', 'missing-session', 'session-timeout'].indexOf(res.text) === -1) {
                            this.addError('documents','error')
                            callback(err)
                        } else {
                            callback(null)
                        }
                    })

            } else {
                if (this.cleanedData.documents.length > 0) {
                    this.addError('howSupplyingDocuments', 'Untick the "I will post the documents" option')
                    return
                }
                if (this.cleanedData.docConfirmation && this.cleanedData.docConfirmation === 'Y') {
                    this.addError('docConfirmation', 'Untick the "Confirm that this is your/the applicant\'s document" option')
                    return
                }

                RestClient()
                    .post(Global.getDocumentSendUrl())
                    .query({'type': 'Document'})
                    .send(userInfo)
                    .end((err, res) => {
                        if (err || res.serverError || res.clientError || ['ok', 'missing-session', 'session-timeout'].indexOf(res.text) === -1) {
                            this.addError('documents', generateErrorMessage(res.text))
                        } else {
                            callback(null)
                        }
                    })
            }
        } else {
            callback(null)
        }
    },

    render() {

        var bfo = this.boundFieldsObj()

        return (
            <div>
                <div style={{"marginBottom": "50px"}}>
                    <div className="form-group file-upload-form">
                        {Render.section({body: Render.field(bfo.documents)})}
                        {Render.section({body: Render.field(bfo.docConfirmation)})}
                    </div>
                </div>
            </div>

        )
    }
})

// DocumentUploadForm.FetchAuxiliaryData = DocumentUploadAuxiliaryData

module.exports = {
    DocumentUploadForm
}
