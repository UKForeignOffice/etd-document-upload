'use strict'

var React = require('react')
var logger = require('../../utils/logs/logger').getLogger('OfflinePhotoSection')
var _ = require('lodash')

var OfflinePhotoSection = React.createClass({
    propTypes: {
        sessionData: React.PropTypes.object,
        auxiliaryData: React.PropTypes.object,
        toggleOfflinePhoto: React.PropTypes.func
    },

    getInitialState: function () {
        return {
            showQuoteRef: false
        }
    },

    toggleOfflinePhotoClicked(e) {
        this.setState({showQuoteRef: !this.state.showQuoteRef})
        this.props.toggleOfflinePhoto(!this.state.showQuoteRef)
    },

    quoteRefSection(ref) {
        return (
            <div className='note'>Quote your application reference ({ref}) on the back of your photo.</div>
        )
    },

    render() {
        var sessionData = this.props.sessionData
        var auxiliaryData = this.props.auxiliaryData

        var postData = _.find(_.get(auxiliaryData, 'posts'), {'prefix': _.get(sessionData, 'UploadData.reference').substring(0, 3)})
        var hubData = _.find(_.get(auxiliaryData, 'posts'), {'postId': _.get(postData, 'pilot.associatedhub')})

        if (!postData) {
            logger.error('Could not locate post data for reference: ' + _.get(sessionData, 'UploadData.reference'))
        }

        var postAddressText
        if (_.get(postData, 'pilot.posttype') === 'SPOKE') {
            if (!hubData) {
                logger.error('Could not locate hub data for post from ETD reference: ' + _.get(sessionData, 'UploadData.reference'))
            }
            postAddressText = (_.get(hubData, 'address')) ? _.get(hubData, 'address') : 'The post\'s address'
        } else {
            postAddressText = (_.get(postData, 'address')) ? _.get(postData, 'address') : 'The post\'s address'
        }

        var sendText = (_.get(postData, 'pilot.hubspoke') === 'Y') ? 'I will post a photo' : 'I will bring a photo to the appointment'

        return (
            <div className='panel panel-border-narrow'>
                <p>Your application will be processed quicker if you take a digital photo and add it online.
                    You are able to add your photo at another time using the link that we have already sent you.</p>
                {_.get(postData, 'pilot.hubspoke') === 'Y' &&
                <p>You should do this or post your photo as soon as possible.</p>
                }
                <p>You could consider asking someone to help you take your photo such as a holiday rep or hotel staff.
                    Many photo shops will also offer a digital photo service.</p>
                {_.get(postData, 'pilot.hubspoke') === 'Y' &&
                <div>
                    <p>If you can't take a digital photo you can send a printed one, but this will delay your
                        application.</p>
                    <p>Photos can be sent to :
                        <div className='indented' dangerouslySetInnerHTML={{__html: postAddressText.replace(/ *, */g, '<br>')}} />
                    </p>
                </div>
                }
                {_.get(postData, 'pilot.standard') === 'Y' &&
                <p>If you can't take a digital photo you can bring a printed one to your appointment, but this will
                    delay your application.</p>
                }
                <fieldset id="form-group-how-supplying-photo" className="form-group default">
                    <div className="form-group form-group-compound default">
                        <div className="multiple-choice">
                            <input id="id_howSupplyingPhoto_0" type="checkbox" name="howSupplyingPhoto"
                                   value="Y" onClick={function (e) {
                                this.toggleOfflinePhotoClicked(e)
                            }.bind(this)}/>
                            <label className="" htmlFor="id_howSupplyingDocuments_0">{sendText}</label>
                        </div>
                    </div>
                    {this.state.showQuoteRef && this.quoteRefSection(_.get(sessionData, 'UploadData.reference'))}
                </fieldset>
            </div>
        )

    }
})

module.exports = OfflinePhotoSection
