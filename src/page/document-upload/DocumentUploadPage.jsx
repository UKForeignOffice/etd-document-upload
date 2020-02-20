'use strict';

var React = require('react')
var BackButton = require('../../component/BackButton')
var _ = require('lodash')
var {DocumentUploadForm} = require('./DocumentUploadForm')
var IsomorphicForm = require('../../component/IsomorphicForm')
var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var {IsomorphicFormMixIn} = require('../../component/IsomorphicFormMixIn')
var DocumentUploadRouting = require('./DocumentUploadRouting')
var tasklistUtils = require('../../utils/tasklistUtils')
var UploadInfo = require('../../component/UploadInfo')
var SummaryErrors = require('../../component/SummaryErrors')


var DocumentUploadPage = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: 'Add your document',
        formName: 'DocumentUploadForm',
        nextRoute: DocumentUploadRouting
    },

    getInitialState: function () {
        return {
            showOfflineDocsSection: false,
            showViewGuideSection: false,
            isSupplyingDocumentsOffline: false
        }
    },

    showSpinner() {
      this.spinnerCheck = setInterval(function() {
        if (this.refs['documentUploadForm'] && !this.refs['documentUploadForm'].getErrorMessages().length) {
          this.spinner = 'inline-block'
          this.buttonStatus = 'disabled'
          this.forceUpdate()
        } else {
          this.spinner = 'none'
          this.buttonStatus = 'enabled'
          clearInterval(this.spinnerCheck)
          this.forceUpdate()
        }
      }.bind(this), 200)
    },
    spinnerCheck: null,
    buttonStatus: 'enabled',
    spinner: 'none',

    toggleOfflineDocsSection(e) {
        e.preventDefault()
        this.setState({showOfflineDocsSection: !this.state.showOfflineDocsSection})
    },

    toggleViewGuideSection(e) {
        e.preventDefault()
        this.setState({showViewGuideSection: !this.state.showViewGuideSection})
    },

    toggleHowSupplyingDocuments(e) {
        this.setState({isSupplyingDocumentsOffline: !this.state.isSupplyingDocumentsOffline})
    },

    docsOfflineSection(postData, auxiliaryData) {
        var sendAddress
        if (postData.pilot.posttype === 'SPOKE') {
            sendAddress = _.find(auxiliaryData.posts, {'postId': postData.pilot.associatedhub}).address.replace(/ *, */g, '<br>')
        } else {
            sendAddress = postData.address.replace(/ *, */g, '<br>')
        }

        var sendText = (postData.pilot.hubspoke === 'Y') ? 'I will post the documents' : 'I will bring the documents to the appointment'

        return (
            <div className='panel panel-border-narrow'>
                <p>Your application will be processed more quickly if you add a document online. You are able to add a document at another time using the link that we have already sent you.</p>

               <p>You could consider asking someone to help you to add the document, such as a holiday rep or hotel staff.</p>

                {_.get(postData, 'pilot.standard') === 'Y' &&
                <p>If you are unable to add a scan, a photo or a screenshot of your document you can bring a printed copy to your appointment, but this will delay your application.</p>
                }

                {_.get(postData, 'pilot.hubspoke') === 'Y' &&
                <div style={{"marginBottom":"30px"}}>
                    <p>Documents can be sent to :</p>
                    <div className='indented' dangerouslySetInnerHTML={{__html: sendAddress}}/>
                </div>
                }

                <fieldset id="form-group-how-supplying-documents" className="form-group default">
                    <div className="form-group form-group-compound default">
                        <div className="multiple-choice">
                            <input id="id_howSupplyingDocuments_0" type="checkbox" name="howSupplyingDocuments"
                                   value="Y" onMouseUp={this.showOfflineAdvice.bind(this)} onClick={function (e) {
                                this.toggleHowSupplyingDocuments(e)
                            }.bind(this)} href='javascript:void(0)' />
                            <label className="" htmlFor="id_howSupplyingDocuments_0">{sendText}</label>
                        </div>
                    </div>
                <div id='offlineSection' style={{'display':'none','marginTop': '50px', 'marginLeft': '50px'}} className='note' >Quote your application reference number on the back of your documents.</div>
                </fieldset>


            </div>
        )
    },

    clearConfirmationCheckBox(){
        document.getElementById("id_docConfirmation_0").checked=false
    },

    showOfflineAdvice(){
        if (document.getElementById("offlineSection").style.display=='block') {
           document.getElementById("offlineSection").style.display='none'
		}
	    else if (document.getElementById("offlineSection").style.display=='none') {
           document.getElementById("offlineSection").style.display='block'
		}

    },

    showGuideSection() {
        return (
            <div className='panel panel-border-narrow'>
                <ul className="list-bullet">
                    <li>Lay it flat on a table or for better results against a wall.</li>
                    <li>Make sure your address is readable.</li>
                    <li>No flash if possible.</li>
                    <li>Position the phone parallel to the document.</li>
                    <li>Use both hands to keep your phone steady.</li>
                </ul>
            </div>
        )
    },

    showBulletPoints(taskName) {
        var displayText = tasklistUtils.getBulletPoints(taskName)
        if (!displayText) {
            return null
        }
        return (
            _.map(displayText.split("|"), function (item) {
                return (<li>{item}</li>)
            })
        )
    },

    render() {
        var sessionData = new IsomorphicFormDataHolder(this.props.data).getSessionData()
        var auxiliaryData = new IsomorphicFormDataHolder(this.props.data).getAuxiliaryData()
        var postData
        if (_.get(sessionData, 'UploadData.referenceType') === 'ETDONLINE') {
            postData = _.find(auxiliaryData.posts, {'prefix': _.get(sessionData, 'UploadData.reference').substring(0, 3)})
        }
        var errorMessagesArray = this.getErrorMessagesFromForm('documentUploadForm')

        // Prioritise query over uploadData store
        var taskName = (this.props.query.type) ? this.props.query.type : _.get(sessionData, 'UploadData.assetType')

        var fromLink = _.get(sessionData, 'UploadData.fromLink')

        var submitButtonText = (this.state.isSupplyingDocumentsOffline) ? 'Next' : 'Add to my application and continue'

        return (
            <div>
                <div className="grid-row">

                    <div className="column-third add-title-margin note">
                        <UploadInfo sessionData={sessionData}/>
                        <p><img src="/img/photoguide/photodocument.jpg"
                                                           alt="Uploading documents"/></p>
                    </div>

                    <div className="column-two-thirds">
                        <BackButton />
<h1 className="heading-large">Add your document</h1>

                        <SummaryErrors messages={errorMessagesArray}/>

                        <div>
                            <p>{tasklistUtils.getTaskText(taskName)}</p>
                            <p>{tasklistUtils.getBulletPointsIntro(taskName)}</p>

                            <ul className={tasklistUtils.getBulletListType(taskName)}>{this.showBulletPoints(taskName)}</ul>

                            <p>{tasklistUtils.getBulletPointsOutro(taskName)}</p>

                            <IsomorphicForm onLoad={function() {this.clearConfirmationCheckBox()}.bind(this)} form={DocumentUploadForm} disableSummary='true' query={this.props.query} ref='documentUploadForm'>

                                <input type={"hidden"} name={"documentType"} value={"Document"}/>

                                <div style={{'clear': 'both'}}>

                                    <button onClick={this.showSpinner} type="submit" className={this.buttonStatus + " button button-right-float"}>
                                        {submitButtonText}
                                        <img id="spinner"
                                             className="spinner"
                                             src='img/spinner.gif'
                                             alt='Please wait'
                                             title='Please wait'
                                             style={{'display': this.spinner}}/>
                                    </button>

                                    <h3 className='heading-medium'>More help</h3>

                                    <p style={{'clear':'both'}} className='showfordesktop'>If you're on a desktop or laptop computer and don't already have a file saved, you may find it easier on a mobile phone or a tablet.</p>

                                    <div className='togglelink'>
                                        <a href=""
                                           onClick={function (e) {
                                               this.toggleViewGuideSection(e)
                                           }.bind(this)}> How to photograph your document</a>
                                        {this.state.showViewGuideSection && this.showGuideSection()}
                                    </div>



                                </div>

                            </IsomorphicForm>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
})

module.exports = DocumentUploadPage
