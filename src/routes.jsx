'use strict';

var React = require('react');
var {DefaultRoute, NotFoundRoute, Route} = require('@insin/react-router');

module.exports = [
    <Route path="/" handler={require('./component/Main')}>
        <Route name="session-timeout" handler={require('./page/error/SessionTimeoutErrorPage')}/>
        <Route name="generic-error" handler={require('./page/error/GenericErrorPage')}/>
        <Route name="tasks-link-error" handler={require('./page/error/TasklistLinkErrorPage')}/>
        <Route name="tasks-link-expired" handler={require('./page/error/TasklistLinkExpiredPage')}/>
        <Route name="submission-error" handler={require('./page/error/SubmissionErrorPage')}/>
        <Route name="third-party-submission-error" handler={require('./page/error/ThirdPartySubmissionErrorPage')}/>
        <Route name="already-submitted-timeout-error" handler={require('./page/error/PostSubmissionTimeoutErrorPage')}/>
        <Route name="cookies" handler={require('./page/cookie-policy/CookiePolicyPage')}/>
        <Route name="terms-and-conditions" handler={require('./page/terms-and-conditions/TermsAndConditionsPage')}/>
        <Route name="dos-prevention" handler={require('./page/error/DOSPreventionErrorPage')}/>
        <Route name="photo-guide" handler={require('./page/photo-guide/PhotoGuide')}/>
        <Route name="document-guide" handler={require('./page/document-guide/DocumentGuide')}/>
        <Route name="photo-upload-about" handler={require('./page/photo-upload-about/AboutYourPhotoPage')}/>
        <Route name="photo-upload" handler={require('./page/photo-upload/PhotoUploadPage')}/>
        <Route name="photo-confirm" handler={require('./page/photo-confirm/PhotoConfirmPage')}/>
        <Route name="photo-success" handler={require('./page/photo-success/PhotoSuccessPage')}/>
        <DefaultRoute name="document-upload" handler={require('./page/document-upload/DocumentUploadPage')}/>
        <Route name="document-success" handler={require('./page/document-success/DocumentSuccessPage')}/>
        <NotFoundRoute name="notFound" handler={require('./component/NotFound')}/>
    </Route>
];
