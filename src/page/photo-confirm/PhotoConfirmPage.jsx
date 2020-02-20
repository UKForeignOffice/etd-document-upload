'use strict'

var React = require('react')
var BackButton = require('../../component/BackButton')
var env = require('../../utils/env')
var {PhotoConfirmForm} = require('./PhotoConfirmForm')
var IsomorphicForm = require('../../component/IsomorphicForm')
var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var {IsomorphicFormMixIn} = require('../../component/IsomorphicFormMixIn')
var UploadInfo = require('../../component/UploadInfo')
var nextRoute = require('./PhotoConfirmRouting')
var logger = require('../../utils/logs/logger').getLogger('PhotoConfirmPage')

var pageTitle = "Check your photo and submit"

var generateErrorMessage = function (code) {
    switch (code) {
        case 'feature-not-detected':
            return 'Your photo failed to meet our checks. You can still add it to your application if you provide a valid reason for your photo failing in the box below. Otherwise, try taking a new photo. Here are <a href="photo-guide" target="_blank">our photo guidelines</a>.'
        case 'feature-boundary-too-small':
            return 'Your photo failed to meet our checks. You were too close to the camera. Sending this photo may delay your application, but you can still do so if you have a valid reason for your photo failing the check. Otherwise, try taking a new photo. Here are <a href="photo-guide" target="_blank">our photo guidelines</a> for more help in taking a photo.'
        case 'feature-too-small':
            return 'Your photo failed to meet our checks. <a href="/photo-upload" id="id_redoPhotoUpload">Try adding another photo</a>.'
        case 'image-too-small':
            return 'Try adding another photo. The photo image you are trying to add is too small. If you get this message again try getting someone else to take your photo or take it from another device. You could also look at <a href="photo-guide" target="_blank">our photo guidelines</a> for more help in taking a photo, otherwise select <a href="/photo-upload" id="id_redoPhotoUpload">Take a new photo</a>.'
        case 'max-image-size-exceeded':
            return 'Your photo failed to meet our checks. You can still add it to your application if you provide a valid reason for your photo failing in the box below. Otherwise, try taking a new photo. Here are <a href="photo-guide" target="_blank">our photo guidelines</a>.'
        case 'processed-image-too-small':
            return 'Try adding another photo. The photo image you are trying to add is too small. If you get this message again try getting someone else to take your photo or take it from another device. You could also look at <a href="photo-guide" target="_blank">our photo guidelines</a> for more help in taking a photo, otherwise select Take another photo link.'
        default:
            return 'Your photo failed to meet our checks. You can still add it to your application if you provide a valid reason for your photo failing in the box below. Otherwise, try taking a new photo. Here are <a href="photo-guide" target="_blank">our photo guidelines</a>.'
    }
}

var PhotoConfirmPage = React.createClass({
    mixins: [IsomorphicFormMixIn],

    statics: {
        title: pageTitle,
        formName: 'PhotoConfirmForm',
        nextRoute: nextRoute
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

    render() {
        var sessionData = new IsomorphicFormDataHolder(this.props.data).getSessionData()
        var photoUploadData = sessionData.PhotoUploadData

        if (env.CLIENT && sessionData.PhotoConfirmForm) {
            if (sessionData.UploadData.fromLink && sessionData.UploadData.fromLink !== '') {
                logger.info("fromlink3: |" + sessionData.UploadData.fromLink + "|")
                window.location = 'task-list'
            } else {
                logger.info("fromlink4: |" + sessionData.UploadData.fromLink + "|")
                window.location = 'photo-success'
            }
        }

        var errorMessage = null

        if (!photoUploadData) {
            logger.error("No session PhotoUploadData data!")
        }

        if (photoUploadData && photoUploadData.photoError) {
            errorMessage = <div id="validationSummary"
                                dangerouslySetInnerHTML={{__html: generateErrorMessage(photoUploadData.photoError)}}/>
        }

        return (
            <div className="grid-row">
                <div className="column-third add-title-margin note">
                    <div className="note ref-upload-photo-preview add-title-margin">
                        <UploadInfo sessionData={sessionData} itemPreview={true} />
                    </div>
                </div>

                <div className="column-two-thirds">
                    <BackButton />
<h1 className="heading-large">{pageTitle}</h1>
                    <p>We will manually check your photo and may ask you for another if something isn't right.</p>

                    {errorMessage}

                    <IsomorphicForm form={PhotoConfirmForm} query={this.props.query}>

                        {photoUploadData && photoUploadData.photoError && photoUploadData.canSubmit &&
                        <div className="help-notice clear-float">
                   <span className="heading-small">
                       <p>If you feel that you have a valid reason for your photo failing the checks (such as physical impairment) and want to send the photo anyway, provide your reason above.</p>
                    </span>
                        </div>

                        }

                        {photoUploadData && photoUploadData.canSubmit &&

                        <button onClick={this.showSpinner} style={{'marginTop': '40px'}} type="submit" className="button">
                            Submit photo
                            {this.spinner &&
                            <img id="spinner"
                                 className="spinner"
                                 src='img/spinner.gif'
                                 alt='Please wait'
                                 title='Please wait'/>
                            }
                        </button>
                        }

                    </IsomorphicForm>
                </div>
            </div>
        )
    }
})

module.exports = PhotoConfirmPage
