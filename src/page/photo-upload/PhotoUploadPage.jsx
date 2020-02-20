'use strict';

var React = require('react')
var BackButton = require('../../component/BackButton')
var {PhotoUploadForm} = require('./PhotoUploadForm')
var IsomorphicForm = require('../../component/IsomorphicForm')
var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var {IsomorphicFormMixIn} = require('../../component/IsomorphicFormMixIn')
var UploadInfo = require('../../component/UploadInfo')
var SummaryErrors = require('../../component/SummaryErrors')

var pageTitle = "Add your photo"

var PhotoUploadPage = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: pageTitle,
        formName: 'PhotoUploadForm',
        nextRoute: 'photo-confirm'
    },
    showSpinner() {
        this.spinnerCheck = setInterval(function() {
            if (this.refs['photoUploadForm'] && !this.refs['photoUploadForm'].getErrorMessages().length) {
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

    componentWillUnmount() {
        clearTimeout(this.spinnerCheck)
    },

    clearConfirmationCheckBox(){
        document.getElementById("id_photoConfirmation_0").checked=false
    },

    render() {
        var sessionData = new IsomorphicFormDataHolder(this.props.data).getSessionData()
        var errorMessagesArray = this.getErrorMessagesFromForm('photoUploadForm')

        return (
            <div className="grid-row">
                <div className="column-third add-title-margin note">
                    <p><UploadInfo sessionData={sessionData} /></p>
                </div>

                <div className="column-two-thirds">
                    <BackButton />
<h1 className="heading-large">{pageTitle}</h1>

                    <SummaryErrors messages={errorMessagesArray}/>

                    <p>You can take the photo now or choose one that you have previously taken.</p>
                    <p>If you have an existing photo, you can add it now. It must be a recent photo that is a true
                        likeness of yourself and meet the <a href='photo-guide' target="_blank">photo requirements.</a></p>
                    <p>We accept most file types and sizes so you shouldn't have to change your file once you
                        have selected it.</p>
                    <p>Select ‘Choose file’ to search for and choose a photo or to take a photo.<span className='hide-small'> If you are on a desktop computer you could drag the photo into the box below.</span></p>

                    <IsomorphicForm  onLoad={function() {this.clearConfirmationCheckBox()}.bind(this)} form={PhotoUploadForm} disableSummary='true' query={this.props.query} ref='photoUploadForm'>
                        <button onClick={this.showSpinner} type="submit" className={this.buttonStatus + " button"}>
                            Add this photo to my application
                            {this.spinner &&
                            <img id="spinner"
                                 className="spinner"
                                 src='img/spinner.gif'
                                 alt='Please wait'
                                 title='Please wait'/>
                            }
                        </button>
                    </IsomorphicForm>
                </div>



            </div>
        )
    }
})

module.exports = PhotoUploadPage
