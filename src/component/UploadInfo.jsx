'use strict'

var React = require('react')
var {Navigation} = require('@insin/react-router')
var Global = require('./Global')
var logger = require('../utils/logs/logger').getLogger('UploadInfo')
var _ = require('lodash')
var env = require('../utils/env')
var PiwikEvent = require('../utils/PiwikEvent')
require('es6-promise').polyfill();
require('isomorphic-fetch');

var UploadInfo = React.createClass({
    mixins: [Navigation],

    propTypes: {
        sessionData: React.PropTypes.object,
        itemPreview: React.PropTypes.bool
    },

    getInitialState: function () {
        return {
            imageIsLoading: true,
            imageFetchAttempts: 0
        }
    },

    fetchPreviewImage: function () {
        this.setState({imageIsLoading: true, imageFetchAttempts: this.state.imageFetchAttempts + 1})

        var self = this
        fetch(Global.getPhotoDisplayUrl(), {
            credentials: 'same-origin',
            method: 'head'
        }).then(
            function (res) {
                if (res.status > 400) {
                    self.imagePreviewLoader = setTimeout(function () {
                        self.fetchPreviewImage()
                    }, 1000)
                    return
                }
                self.setState({
                    imageIsLoading: false
                })
            })
            .catch(
                function (err) {
                    logger.error("Error retrieving photo: ", err)
                    self.setState({
                        imageIsLoading: true,
                    })
                }
            )
    },

    componentDidMount() {
        if (this.props.itemPreview) {
            this.fetchPreviewImage()
        }
    },

    componentWillUnmount() {
        clearTimeout(this.imagePreviewLoader)
    },

    render() {
        var sessionData = this.props.sessionData
        var itemPreviewLink
        var info = {
            ref: null,
            firstName: null
        }

        // if (_.get(sessionData, 'UploadData.reference')) {
        //     info.ref = _.get(sessionData, 'UploadData.reference')
        //     // firstName may not be present (e.g. if user entered via CaseBook link)
        //     info.firstName = _.get(sessionData, 'UploadData.firstName')
        // } else if (_.get(sessionData, 'CasebookForm.etdOnlineReference')) {
        //     info.ref = _.get(sessionData, 'CasebookForm.etdOnlineReference')
        //     info.firstName = _.get(sessionData, 'NameForm.applicantFirstName')
        // } else {
        //     // TODO Shouldn't be able to get here, we need to work out why it sometimes happens
        //     // Redirecting user to timeout page as lack of session data just leads to subsequent errors
        //     logger.error("Invalid UploadInfo session data, sending user to generic-error page")
        //     PiwikEvent.fire('Invalid UploadInfo session data, sending user to generic-error page')
        //     if (env.CLIENT) {
        //         window.location = this.makeHref('generic-error')
        //     }
        // }

        if (this.props.itemPreview) {
            if (this.state.imageIsLoading) {
                itemPreviewLink =
                    <div className='photo-upload-preview'>
                        <img id="spinner"
                             className="spinner"
                             src='img/spinner.gif'
                             alt='Please wait'
                             title='Please wait'
                             width='16'
                             height='16'
                        />
                    </div>
            } else {
                itemPreviewLink =
                    <div className='photo-upload-preview'>
                        <img className='photo-preview' src={Global.getPhotoDisplayUrl()}/>
                    </div>
            }
        }

        return (
            <div>
                <p>
                    {info.ref &&
                    `Application Reference: ${info.ref}`
                    }<br/>
                    <span style={{'fontSize': '22px', 'fontWeight': 'bold'}}>
                    {info.firstName &&
                    `${info.firstName}`
                    }</span>
                </p>

                {itemPreviewLink}
            </div>
        )
    }
})

module.exports = UploadInfo
