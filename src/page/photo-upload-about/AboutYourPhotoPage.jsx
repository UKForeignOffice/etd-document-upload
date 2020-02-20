'use strict'

var React = require('react')
var BackButton = require('../../component/BackButton')
var {AboutYourPhotoForm} = require('./AboutYourPhotoForm')
var IsomorphicForm = require('../../component/IsomorphicForm')
var {IsomorphicFormMixIn} = require('../../component/IsomorphicFormMixIn')
var IsomorphicFormDataHolder = require('../../component/IsomorphicFormDataHolder')
var UploadInfo = require('../../component/UploadInfo')
var {Navigation} = require('@insin/react-router')
var _ = require('lodash')
var pageTitle = "Photo requirements"
var AboutYourPhotoRouting = require('./AboutYourPhotoRouting')
var OfflinePhotoSection = require('./OfflinePhotoSection')

var AboutYourPhotoPage = React.createClass({
    mixins: [Navigation, IsomorphicFormMixIn],
    statics: {
        formName: 'AboutYourPhotoForm',
        title: pageTitle,
        nextRoute: AboutYourPhotoRouting,
    },

    getInitialState: function () {
        return {
            showPhotoGuideSection: false,
            showOfflineSendSection: false,
            fromLink: false,
            offlinePhoto: false
        }
    },

    togglePhotoGuideSection(e) {
        e.preventDefault()
        this.setState({showPhotoGuideSection: !this.state.showPhotoGuideSection})
    },

    photoGuideSection() {
        return (
            <div className='panel panel-border-narrow'>
                <p>This <a className='togglelink-internal' href='photo-guide' target='_blank'>guide</a> will show you
                    how to take a digital photo that meets the emergency travel document photo rules.</p>
            </div>
        )
    },

    toggleOfflineSendSection(e) {
        e.preventDefault()
        this.setState({showOfflineSendSection: !this.state.showOfflineSendSection})
    },

    toggleOfflinePhoto(isOffline) {
        this.setState({offlinePhoto: isOffline})
    },

    renderButtonTextSection() {
        var buttonText = this.state.offlinePhoto ? 'Next' : 'Next - add your photo'
        var ariaText = this.state.offlinePhoto ? 'Next' : 'Next - add your photo'

        return (
            <div key={'buttonTextSection'}>
                <button aria-label={ariaText} type="submit"
                        className={"button button-right-float"}>
                    {buttonText}
                </button>
                {!this.state.fromLink && !this.state.offlinePhoto &&
                <a className="previousarrowleft" href="task-list">Back to Task List</a>
                }
            </div>
        )
    },

    render() {
        var sessionData = new IsomorphicFormDataHolder(this.props.data).getSessionData()
        var auxiliaryData = new IsomorphicFormDataHolder(this.props.data).getAuxiliaryData()

        var fromLink = _.get(sessionData, 'UploadData.fromLink')
        
        return (
            <div>
                <div className="grid-row">
                    <div className="column-third add-title-margin note">
                        <UploadInfo sessionData={sessionData}/>
                        <p><img style={{'height': 'auto', 'width': '300px'}} src="/img/photoguide/aboutyourphoto.jpg"
                                alt="Good example of a passport photo"/>
                            <div className='note'>Example of a good passport photo</div>
                        </p>
                    </div>

                    <div className="column-two-thirds">
                        <BackButton />
                        <h1 className="heading-large">{pageTitle}</h1>
                        <h3 className="heading-medium">Make sure your photo meets the requirements below. Not doing so will delay your application. </h3>
                        <ul className="list-number">
                            <li>Use a plain light background</li>
                            <li>Face the camera with your eyes open and visible</li>
                            <li>Don't smile (applicants aged 7 and over)</li>
                            <li>Keep your mouth closed (applicants aged 7 and over)</li>
                            <li>Take your glasses off</li>
                            <li>Keep your hair away from your face</li>
                            <li>Don't wear a hat or any headgear (unless for religious reasons)</li>
                            <li>Make sure that there are no shadows on your face or behind you</li>
                            <li>The photo should include your head and shoulders and have space around them</li>
                            <li>You don't have to crop your photo, as we will do it for you</li>
                        </ul>

                        <IsomorphicForm query={this.props.query} form={AboutYourPhotoForm}>
                            {this.renderButtonTextSection()}

                            <h3 className='heading-medium'>More help</h3>
                            <p style={{'clear': 'both'}} className='showfordesktop'>If you're on a desktop or laptop
                                computer and
                                don't already have a file saved, you may find it easier on a mobile phone or a
                                tablet.</p>

                            {!fromLink &&
                            <div className='togglelink'>
                                <a onClick={function (e) {
                                    this.toggleOfflineSendSection(e)
                                }.bind(this)} href=''>I have a printed photo / I
                                    can't add photo</a>
                                {this.state.showOfflineSendSection &&
                                <OfflinePhotoSection sessionData={sessionData} auxiliaryData={auxiliaryData}
                                                     toggleOfflinePhoto={this.toggleOfflinePhoto}/>
                                }
                            </div>
                            }

                            <div className='togglelink'>
                                <a onClick={function (e) {
                                    this.togglePhotoGuideSection(e)
                                }.bind(this)} href=''>View detailed photo guide</a>
                                {this.state.showPhotoGuideSection && this.photoGuideSection()}
                            </div>
                        </IsomorphicForm>
                    </div>
                </div>
            </div>
        )
    }
})

module.exports = AboutYourPhotoPage
