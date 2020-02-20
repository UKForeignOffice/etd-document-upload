'use strict';

var _ = require('lodash')
var uuid = require('uuid')
var logger = require('./logs/logger').getLogger('Message Types')
var messageTypes = {}
var moment = require('moment')

messageTypes.courierSupportAvailable = function(sessionData){
    var courierSupport = _.get(sessionData,  'AppointmentForm.courierSupport')
    var under16 = messageTypes.under16Check(sessionData)
    var etdReason = _.get(sessionData,  'EtdReasonForm.etdReason')
    var isBritCit = _.get(sessionData, 'BritishCitizenForm.isBritishCitizen')
    var UKTravel = messageTypes.isUnitedKingdomPartOfJourney(sessionData)

    if (courierSupport === 'Y' && under16 !== true
        && (etdReason === 'stolen' || etdReason === 'unavailable' || etdReason === 'lost' || etdReason === 'visaProcessing')) {
        if (isBritCit === 'N' && UKTravel === true) {
            return false;
        } else {
            return true;
        }
    }
    return false
}

messageTypes.under16Check = function (sessionData) {
    var dob = _.get(sessionData, 'NameForm.birthDate')
    var formattedDob = moment(dob, 'DD-MM-YYYY')
    var applicantAge = moment().diff(formattedDob, 'years');

    if (applicantAge < 16) {
        logger.info("Applicant under 16")
        return true
    }
    else {
        logger.info("Applicant over 16")
        return false
    }
}

messageTypes.isUnitedKingdomPartOfJourney = function(sessionData){
    var destinationName =  _.get(sessionData, 'JourneyDetailsForm.destinationCountryCasebooklabel')
    var returnDestinationName = _.get(sessionData, 'JourneyDetailsForm.returnToWhereYouAre') === 'Y' ? _.get(sessionData, 'WhatCountryForm.nowCountryCasebookLabel') : null
    if((destinationName != null && "united kingdom" === destinationName.toLowerCase()) ||
        (returnDestinationName != null && "united kingdom" === returnDestinationName.toLowerCase())) {
        return true
    }
    var transitToDestination1 = _.get(sessionData, 'JourneyDetailsForm.transitToDestination1Casebooklabel')
    var transitToDestination2 = _.get(sessionData, 'JourneyDetailsForm.transitToDestination2Casebooklabel')
    var transitToDestination3 = _.get(sessionData, 'JourneyDetailsForm.transitToDestination3Casebooklabel')
    var transitToDestination4 = _.get(sessionData, 'JourneyDetailsForm.transitToDestination4Casebooklabel')
    var transitToDestination5 = _.get(sessionData, 'JourneyDetailsForm.transitToDestination5Casebooklabel')
    var transitReturnDestination1 = _.get(sessionData, 'JourneyDetailsForm.transitReturnDestination1Casebooklabel')
    var transitReturnDestination2 = _.get(sessionData, 'JourneyDetailsForm.transitReturnDestination2Casebooklabel')
    var transitReturnDestination3 = _.get(sessionData, 'JourneyDetailsForm.transitReturnDestination3Casebooklabel')
    var transitReturnDestination4 = _.get(sessionData, 'JourneyDetailsForm.transitReturnDestination4Casebooklabel')
    var transitReturnDestination5 = _.get(sessionData, 'JourneyDetailsForm.transitReturnDestination5Casebooklabel')
    var ukPartOfJourney = false
    _.filter([transitToDestination1, transitToDestination2, transitToDestination3, transitToDestination4, transitToDestination5,
        transitReturnDestination1, transitReturnDestination2, transitReturnDestination3,
        transitReturnDestination4, transitReturnDestination5], function (i) {
        if (!_.isEmpty(i) && "united kingdom" === i.toLowerCase()) {
            ukPartOfJourney= true
        }
    })
    return ukPartOfJourney
}

messageTypes.generateSystemReference = function (props) {
    var defaultProps = {
        systemReference: null,
        systemReferenceType: 'ETDONLINE'
    }

    _.assign(defaultProps, _.pick(props, _.keys(defaultProps)))
    return defaultProps
}

messageTypes.newEtdMessageType = function (props) {
    var defaultProps = {
        publisherName: 'etd-online-portal',
        assets: [],
        refs: [],
        etdApplication: {}
    }

    _.assign(defaultProps, _.pick(props, _.keys(defaultProps)))

    return {
        etd: {
            guid: uuid(),
            publisher: {
                name: defaultProps.publisherName
            },
            refs: defaultProps.refs,
            etdApplication: defaultProps.etdApplication
        },
        assets: defaultProps.assets
    }
}

messageTypes.putEtdDetailsMessageType = function (props) {
    var defaultProps = {
        refs: [],
        assets: [],
        etdApplication: {}
    }

    _.assign(defaultProps, _.pick(props, _.keys(defaultProps)))

    return {
        putETDDetails: {
            requestInfo:{
              requestTimestamp: new Date().toISOString(),
              requestGUID: uuid()
            },
            refs: defaultProps.refs,
            applicant: defaultProps.etdApplication.applicant,
            applicationInfo: defaultProps.etdApplication.applicationInfo,
            applicationReason: defaultProps.etdApplication.applicationReason,
            assignment: defaultProps.etdApplication.assignment,
            feedback: defaultProps.etdApplication.feedback,
            journey: defaultProps.etdApplication.journey,
            lostStolen: defaultProps.etdApplication.lostStolen,
            payment: defaultProps.etdApplication.payment,
            representative: defaultProps.etdApplication.representative,
            collectionInfo: defaultProps.etdApplication.collectionInfo
        },
        assets: defaultProps.assets
    }
}

messageTypes.putEtdDetailsPaymentType = function (props) {
    var defaultProps = {
        refs: [],
        assets: [],
        etdApplication: {}
    }

    _.assign(defaultProps, _.pick(props, _.keys(defaultProps)))

    return {
        putETDDetails: {
            requestInfo:{
              requestTimestamp: new Date().toISOString(),
              requestGUID: uuid()
            },
            refs: defaultProps.refs,
            payment: defaultProps.etdApplication.payment,
            collectionInfo: defaultProps.etdApplication.collectionInfo
        },
    }
}

messageTypes.putEtdDetailsCourierOrCollection = function (props) {
    var defaultProps = {
        refs: [],
        etdApplication: {}
    }

    _.assign(defaultProps, _.pick(props, _.keys(defaultProps)))

    return {
        putETDDetails: {
            requestInfo:{
              requestTimestamp: new Date().toISOString(),
              requestGUID: uuid()
            },
            refs: defaultProps.refs,
            collectionInfo: defaultProps.etdApplication.collectionInfo,
        },
    }
}

messageTypes.etdAssetMessageType = function (props) {
    var defaultProps = {
        assetType: null,
        assetMIMEType: null,
        assetContext: null,
        dataString: null,
        assetOtherTypeDescription: null,
        publisherName: 'etd-online-portal',
        assetUploadTimestamp: null,
        refs: []
    }

    _.assign(defaultProps, _.pick(props, _.keys(defaultProps)))

    return {
        etdAsset: {
            guid: uuid(),
            publisher: {
                name: defaultProps.publisherName
            },
            assetType: defaultProps.assetType,
            assetMIMEType: defaultProps.assetMIMEType,
            assetContext: defaultProps.assetContext,
            data: defaultProps.dataString,
            assetOtherTypeDescription: defaultProps.assetOtherTypeDescription,
            assetUploadTimestamp: new Date().toISOString(),
            refs: defaultProps.refs
        }
    }
}

messageTypes.generateETDApplication = function (data, pdfAssetType) {

    var dateConvert = function (dateString) {
        if (!dateString) {
            return null
        }
        var dateArr = dateString.split('-')
        return dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0]
    }

    var getPreviousFirstNames = function (PreviousNamesForm) {

        if (_.get(PreviousNamesForm, 'wasKnownByOtherNames') === 'N') {
            return
        }


        var previousName1 = (_.get(PreviousNamesForm, 'firstName_1'))
        var previousName2 = (_.get(PreviousNamesForm, 'firstName_2'))
        var previousName3 = (_.get(PreviousNamesForm, 'firstName_3'))

        return _.filter([previousName1, previousName2, previousName3], function (i) {
            return !_.isEmpty(i)
        })
    }
    var getPreviousLastNames = function (PreviousNamesForm) {

        if (_.get(PreviousNamesForm, 'wasKnownByOtherNames') === 'N') {
            return
        }

        var previousName1 = (_.get(PreviousNamesForm, 'lastName_1'))
        var previousName2 = (_.get(PreviousNamesForm, 'lastName_2'))
        var previousName3 = (_.get(PreviousNamesForm, 'lastName_3'))

        return _.filter([previousName1, previousName2, previousName3], function (i) {
            return !_.isEmpty(i)
        })
    }

    var getOutwardTransitCountries = function (journeyForm) {

        var transitToDestination1 = _.get(journeyForm, 'transitToDestination1Casebooklabel')
        var transitToDestination2 = _.get(journeyForm, 'transitToDestination2Casebooklabel')
        var transitToDestination3 = _.get(journeyForm, 'transitToDestination3Casebooklabel')
        var transitToDestination4 = _.get(journeyForm, 'transitToDestination4Casebooklabel')
        var transitToDestination5 = _.get(journeyForm, 'transitToDestination5Casebooklabel')
        var transitCountries = []

        _.filter([transitToDestination1, transitToDestination2, transitToDestination3, transitToDestination4, transitToDestination5], function (i) {
            if (!_.isEmpty(i))
            {
                transitCountries.push({countryName: i})
            }
            return
        })
        return transitCountries
    }

    var getReturnTransitCountries = function (journeyForm) {

        var transitReturnDestination1 = _.get(journeyForm, 'transitReturnDestination1Casebooklabel')
        var transitReturnDestination2 = _.get(journeyForm, 'transitReturnDestination2Casebooklabel')
        var transitReturnDestination3 = _.get(journeyForm, 'transitReturnDestination3Casebooklabel')
        var transitReturnDestination4 = _.get(journeyForm, 'transitReturnDestination4Casebooklabel')
        var transitReturnDestination5 = _.get(journeyForm, 'transitReturnDestination5Casebooklabel')

        var transitReturnCountries = []

        _.filter([transitReturnDestination1, transitReturnDestination2, transitReturnDestination3, transitReturnDestination4, transitReturnDestination5], function (i) {
            if (!_.isEmpty(i)) {
                transitReturnCountries.push({countryName: i})
            }
            return
        })
        return transitReturnCountries
    }


    var getEtdReason = function (etdReason){
        switch (etdReason) {
            case 'lost':
                return 'LOST'
            case 'stolen':
                return 'STOLEN'
            case 'expired':
                return 'EXPIRED'
            case 'full':
                return 'FULL'
            case 'defacedDamaged':
                return 'DEFACED_DAMAGED'
            case 'unavailable':
                return 'WITH_HMPO'
            case 'visaProcessing':
                return 'VISA_PROCESSING'
            case 'neverHad':
                return 'OTHER'
            default:
                return 'OTHER'
        }
    }

    var getJourneyTravelStatus = function (TellusJourneyForm) {
        if (_.get(TellusJourneyForm, 'haveTravelBooked') === 'Y') {
            return 'CONFIRMED'
        }
        else {
            return 'PREFERRED'
        }
    }

    var getPaymentOption = function (PaymentOption) {
        switch (PaymentOption) {
            case 'online':
                return 'ONLINE'
            case 'offline':
                return 'OFFLINE'
            case 'thirdParty':
                return 'THIRD_PARTY'
        }
    }

    var getWhatHappenedToPassport = function (WhatHappened) {
        switch (WhatHappened) {
            case  'While socialising':
                return 'SOCIALISING'
            case 'Mugged / pickpocketed':
                return 'MUGGED_PICKPOCKETED'
            case 'At home':
                return 'AT_HOME'
            case 'From home':
                return 'FROM_HOME'
            case 'While travelling':
                return 'TRAVELLING'
            case 'While moving house':
                return 'MOVING_HOUSE'
            case 'Another reason':
                return 'OTHER'
            case 'I don\'t know':
                return 'UNKNOWN'
            default:
                return 'UNKNOWN'
        }
    }

    var getTravelReason = function (TravelReason) {
        switch (TravelReason) {
            case "For business purposes":
                return "BUSINESS_PURPOSES"
            case "Going on holiday":
                return "HOLIDAY"
            case "To return home":
                return "RETURN_HOME"
            case "To visit friends or family":
                return "VISIT_FRIENDS_FAMILY"
            case "To apply for a new passport":
                return "APPLY_FOR_PASSPORT"
            case "Compassionate reasons":
                return "COMPASSIONATE_REASONS"
            case "Other":
                return "OTHER"
            default:
                return 'NOT_SET'
        }
    }

    var getRelationshipToApplicant = function (relationshipToApplicant) {
        switch (relationshipToApplicant){
            case 'Parent':
                return 'Parent'
            case 'Guardian':
                return 'Guardian'
            case 'Child':
                return 'Child'
            case 'Family':
                return 'Family'
            case 'Friend':
                return 'Friend'
            default:
                return ''
        }
    }



    var isInterviewRequired = function (postData, sessionData) {
        if (_.get(postData, 'pilot.standard') === 'Y' ||  uploadOnlyPost(postData, sessionData) ||
            (under16App(_.get(sessionData, 'NameForm.birthDate'))) ||
            (
                _.get(sessionData, 'EtdReasonForm.etdReason') === 'expired' && (
                    !_.get(sessionData, 'PassportDetailsForm.passportExpiryDate') ||
                    olderThanXDays(_.get(sessionData, 'PassportDetailsForm.passportExpiryDate'), 270)
                ))) {
            return true
        }
        if(_.get(sessionData, 'BritishNationalOverseasForm.isBritishNationalOverseas') === 'Y' ) {
            if(isUnitedKingdomPartOfJourney(_.get(sessionData, 'JourneyDetailsForm',_.get(sessionData, 'WhatCountryForm')))) {
                return true
            }
        }
        return false
    }

    var eligibleForCourier = function (tasklistInfoData) {
        var tasks = _.get(tasklistInfoData, 'requiredItems')
        if (!tasks || !_.includes(tasks, 'DELIVERY_SELECTION')) {
            return
        }
        return true
    }

    var uploadOnlyPost = function (postData, sessionData) {
        if(_.get(postData, 'pilot.photoDocUpload') === 'Y' && _.get(postData, 'pilot.signonreceipt') === 'Y' && _.get(postData, 'pilot.standard') === 'Y') {
            return true
        }
        return false
    }

    var isUnitedKingdomPartOfJourney = function (JourneyDetailsForm,WhatCountryForm) {
            var destinationName =  _.get(data, 'sessionData.JourneyDetailsForm.destinationCountryCasebooklabel')
            var returnDestinationName = _.get(data, 'sessionData.JourneyDetailsForm.returnToWhereYouAre') === 'Y' ? _.get(data, 'sessionData.WhatCountryForm.nowCountryCasebookLabel') : null

            if((destinationName != null && "united kingdom" === destinationName.toLowerCase()) ||
                (returnDestinationName != null && "united kingdom" === returnDestinationName.toLowerCase())) {
                return true
            }
            var transitToDestination1 = _.get(data, 'sessionData.JourneyDetailsForm.transitToDestination1Casebooklabel')
            var transitToDestination2 = _.get(data, 'sessionData.JourneyDetailsForm.transitToDestination2Casebooklabel')
            var transitToDestination3 = _.get(data, 'sessionData.JourneyDetailsForm.transitToDestination3Casebooklabel')
            var transitToDestination4 = _.get(data, 'sessionData.JourneyDetailsForm.transitToDestination4Casebooklabel')
            var transitToDestination5 = _.get(data, 'sessionData.JourneyDetailsForm.transitToDestination5Casebooklabel')

            var transitReturnDestination1 = _.get(data, 'sessionData.JourneyDetailsForm.transitReturnDestination1Casebooklabel')
            var transitReturnDestination2 = _.get(data, 'sessionData.JourneyDetailsForm.transitReturnDestination2Casebooklabel')
            var transitReturnDestination3 = _.get(data, 'sessionData.JourneyDetailsForm.transitReturnDestination3Casebooklabel')
            var transitReturnDestination4 = _.get(data, 'sessionData.JourneyDetailsForm.transitReturnDestination4Casebooklabel')
            var transitReturnDestination5 = _.get(data, 'sessionData.JourneyDetailsForm.transitReturnDestination5Casebooklabel')

            var ukPartOfJourney = false
          _.filter([transitToDestination1, transitToDestination2, transitToDestination3, transitToDestination4, transitToDestination5,
                        transitReturnDestination1, transitReturnDestination2, transitReturnDestination3,
                        transitReturnDestination4, transitReturnDestination5], function (i) {
                if (!_.isEmpty(i) && "united kingdom" === i.toLowerCase()) {
                    ukPartOfJourney= true
                }
            })

            return ukPartOfJourney
        }

    var under16App = function (dob) {
        var formattedDob = moment(dob, 'DD-MM-YYYY')
        var applicantAge = moment().diff(formattedDob, 'years');

        if (applicantAge < 16) {
            logger.info("Applicant under 16")
            return true
        }
        else {
            logger.info("Applicant over 16")
            return false
        }
    }

    var olderThanXDays = function (dateStringUKFormat, days) {
        var splitDate = dateStringUKFormat.split('-');
        var dateGiven = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]) // Javascript months are 0-11
        var dateDaysAgo = new Date(new Date().setDate(new Date().getDate() - days))
        return (dateGiven < dateDaysAgo)
    }

    //Filter requiredItems from tasklist and remove items that are not assets
    //TODO - cross reference the removeRequiredTasks with tasklistUtils to check if items are an asset instead of a hardcoded array
    var getRequiredAssets = function (tasklistInfoData, IsSelfApplying, dob) {
        if (!_.get(tasklistInfoData, 'requiredItems')) {
            return
        }

        var requiredItemsArr = _.get(tasklistInfoData, 'requiredItems').split(',')
        requiredItemsArr.push(under16App(dob) ? 'CHILD_APPLICATION' : 'ADULT_APPLICATION')
        var removeRequiredTasks = ['ELIGIBILITY', 'APPLICATION_DETAILS', 'COLLECT_DOCUMENT', 'BOOK_APPOINTMENT', 'COMPLETE_APPLICATION', 'PAYMENT','DELIVERY_SELECTION']
        var requiredAssetArr = requiredItemsArr.filter(item => !removeRequiredTasks.includes(item))

        return requiredAssetArr
    }

    // Remove keys with null, undefined or empty string values to help with data integrity
    var removeEmptyKeysFromObject = function (obj) {
        Object.keys(obj).forEach(key => {
            if (Object.prototype.toString.call(obj[key])  ===  '[object Date]' && obj[key].toString().length === 0) {
                delete obj[key];
            } else if (obj[key] && typeof obj[key] === 'object') {
                removeEmptyKeysFromObject(obj[key]);
            } else if (obj[key] == null || obj[key] === "") {
                delete obj[key];
            }

            if (obj[key] && typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0 && Object.prototype.toString.call(obj[key])  !==  '[object Date]') {
                delete obj[key];
            }

        });
        return obj;
    }

    return removeEmptyKeysFromObject({
        "applicant": {
            "birthCountryName": _.get(data, 'sessionData.NameForm.birthCountryCasebookLabel'),//getCasebookLabelCountry(_.get(data, 'sessionData.NameForm.birthCountry'), callback),//
            "birthdate": dateConvert(_.get(data, 'sessionData.NameForm.birthDate')),
            "birthTown": _.get(data, 'sessionData.NameForm.birthCity'),
            "contactNumber": _.get(data, 'sessionData.ContactDetailsForm.contactPhone'),
            "emailAddress": _.get(data, 'sessionData.ContactDetailsForm.contactEmail'),
            "firstName": _.get(data, 'sessionData.NameForm.applicantFirstNameOrig'),
            "gender": _.get(data, 'sessionData.NameForm.gender').replace(/^\w/, c => c.toUpperCase()),
            "homeAddressHouseNumber": _.get(data, 'sessionData.ContactDetailsForm.number'),
            "homeAddressStreet": _.get(data, 'sessionData.ContactDetailsForm.street'),
            "homeAddressTown": _.get(data, 'sessionData.ContactDetailsForm.town'),
            "homeAddressCountryName":  _.get(data, 'sessionData.ContactDetailsForm.countryCasebookLabel'),
            "homeAddressPostcode": _.get(data, 'sessionData.ContactDetailsForm.addressPostcode'),
            "homeNumber": _.get(data, 'sessionData.ContactDetailsForm.homePhone'),
            "isBritish":  (_.get(data, 'sessionData.BritishCitizenForm.isBritishCitizen') === 'Y'),
            "isBritishNationalOverseas":  (_.get(data, 'sessionData.BritishNationalOverseasForm.isBritishNationalOverseas') === 'Y'),
            "lastName": _.get(data, 'sessionData.NameForm.applicantLastName'),
            "middleName": _.get(data, 'sessionData.NameForm.applicantMiddleName'),
            "hongKongID": _.get(data, 'sessionData.NameForm.hongKongID'),
            "passportExpiry": dateConvert(_.get(data, 'sessionData.PassportDetailsForm.passportExpiryDate')),
            "passportIssueDate": dateConvert(_.get(data, 'sessionData.PassportDetailsForm.passportIssueDate')),
            "passportNumber":  _.get(data, 'sessionData.PassportDetailsForm.passportNumber'),
            "passportPlaceOfIssue": null, //TODO - DOn't think we collect this
            "previousFirstNames": getPreviousFirstNames(_.get(data, 'sessionData.PreviousNamesForm')),
            "previousLastNames": getPreviousLastNames(_.get(data, 'sessionData.PreviousNamesForm')),
            "representativeApplyingOnBehalf": (_.get(data, 'sessionData.SelfApplyingForm.IsSelfApplying') === 'applyingself') ? "NO" : "YES",
            "title": _.get(data, 'sessionData.NameForm.title')
        },
        "applicationInfo": {
            "applicationType": (under16App(_.get(data, 'sessionData.NameForm.birthDate'))) ? "CHILD_BRITISH" : "ADULT_BRITISH",
            "courtCountryName": null,//TODO - Is this worth adding to ETD online?
            "currentCountryName": _.get(data, 'sessionData.WhatCountryForm.nowCountryCasebookLabel'),
            "courtName": null,//TODO - Is this worth adding to ETD online?
            "interviewRequired": isInterviewRequired(_.get(data, 'postData'), _.get(data, 'sessionData')),
            "nearestPostName": _.get(data, 'postData.postId'),
            "otherInformation": _.get(data, 'sessionData.OtherInformationForm.otherInformation'),
            "requiredAssets": getRequiredAssets(_.get(data, 'tasklistInfoData'), _.get(data, 'sessionData.SelfApplyingForm.IsSelfApplying'), _.get(data, 'sessionData.NameForm.birthDate')),
            "submissionTimestamp": new Date().toISOString(),
            "tasklistUrl": _.get(data, 'applicantEmailRequest.tasklistUrl')
        },
        "applicationReason": {
            "fullPassportApplicationDate": _.get(data, 'sessionData.PassportRenewalForm.applicationDate'),
            "fullpassportApplicationReference": _.get(data, 'sessionData.PassportRenewalForm.refNumber'),
            "fullPassportAppliedFor": (_.get(data, 'sessionData.PassportRenewalForm.hasPassportApplication') === 'Y') ? "YES" : "NO",
            "otherReasonDescription": _.get(data, 'sessionData.EtdReasonForm.etdOtherDescription'),
            "reason": getEtdReason(_.get(data, 'sessionData.EtdReasonForm.etdReason')),
            "visaApplicationDate": dateConvert(_.get(data, 'sessionData.VisaWithForeignEmbassyForm.visaSubmissionDate')),
            "visaCountryName": _.get(data, 'sessionData.VisaWithForeignEmbassyForm.visaCountryCasebooklabel'),
            "visaReference": _.get(data, 'sessionData.VisaWithForeignEmbassyForm.visaAppRef'),
        },
        "assignment": {
            "processingPostName": (_.get(data, 'postData.pilot.associatedhub')) ? _.get(data, 'associatedHub.postId') : _.get(data, 'postData.postId'),
        },
        "collectionInfo": {
            "eligibleForCourier": eligibleForCourier(_.get(data, 'tasklistInfoData'))
        },
        "feedback": {
            "commentsOnImprovingService": "",//Same as otherInformation?
            "commentsOnOnlineService": "",//Same as otherInformation?
            "contactIndicator": (_.get(data, 'sessionData.OtherInformationForm.feedback') === 'Y')
        },
        "journey": {
            "confirmationThatEtdCanBeUsed": (!_.get(data, 'sessionData.EntryRequirementsForm') || _.get(data, 'sessionData.EntryRequirementsForm.hasValidEtd') === 'Y'),
            "otherReasonForTravel": _.get(data, 'sessionData.WhyTravelForm.otherTravelReason'),
            "otherReasonTravelIsNotBooked": _.get(data, 'sessionData.TellusNoTravelForm.othernoTravelReason'),
            "moreDetailsTravelIsNotBooked": _.get(data, 'sessionData.TellusNoTravelForm.moreDetailsTravelReason'),
            "reasonForTravel": getTravelReason(_.get(data, 'sessionData.WhyTravelForm.travelReason')),
            "reasonTravelIsNotBooked": _.get(data, 'sessionData.TellusNoTravelForm.notravelReason'),
            "returnRequired": (_.get(data, 'sessionData.JourneyDetailsForm.returnToWhereYouAre') === 'Y'),
            "travelDateTimeStatus": getJourneyTravelStatus(_.get(data, 'sessionData.TellusJourneyForm')),
            "outwardJourney": {
                "arrivalDate": dateConvert(_.get(data, 'sessionData.JourneyDetailsForm.arrivalDate')),
                "departureDate": dateConvert(_.get(data, 'sessionData.JourneyDetailsForm.departureDate')),
                "destinationName": _.get(data, 'sessionData.JourneyDetailsForm.destinationCountryCasebooklabel'),
                "transitCountries": getOutwardTransitCountries(_.get(data, 'sessionData.JourneyDetailsForm'))

            },
            "returnJourney": {
                "arrivalDate": dateConvert(_.get(data, 'sessionData.JourneyDetailsForm.arrivalReturnDate')),
                "departureDate": dateConvert(_.get(data, 'sessionData.JourneyDetailsForm.departReturnDate')),
                "destinationName": (_.get(data, 'sessionData.JourneyDetailsForm.returnToWhereYouAre') === 'Y') ? _.get(data, 'sessionData.WhatCountryForm.nowCountryCasebookLabel') : null,
                "transitCountries": getReturnTransitCountries(_.get(data, 'sessionData.JourneyDetailsForm'))
            }
        },
        "lostStolen": {
            "lossTheftArea": _.get(data, 'sessionData.CircumstancesOfLossForm.lastSeenArea'),
            "lossTheftCountryName": _.get(data, 'sessionData.CircumstancesOfLossForm.lastSeenCountryCasebooklabel'),
            "lossTheftDate": dateConvert(_.get(data, 'sessionData.CircumstancesOfLossForm.lastSeenDate')),
            "lossTheftTown": _.get(data, 'sessionData.CircumstancesOfLossForm.lastSeenPlace'),
            "policeReportDate": dateConvert(_.get(data, 'sessionData.PoliceReportDetailsForm.policeReportDate')),
            "policeReportNumber": _.get(data, 'sessionData.PoliceReportDetailsForm.policeReportNumber'),
            "policeReportStation": _.get(data, 'sessionData.PoliceReportDetailsForm.policeStation'),
            "previouslyReportedLossTheft": (_.get(data, 'sessionData.PreviouslyReportedPassportsForm.havePreviouslyReportedLostOrStolen') === 'Y'),
            "previouslyReportedLossTheftDetails": _.get(data, 'sessionData.PreviouslyReportedPassportsForm.prevReportedDetails'),
            "reportedToPolice": (_.get(data, 'sessionData.PoliceReportDetailsForm.policeNotified') === 'Y'),
            "whatHappened": (_.get(data, 'sessionData.EtdReasonForm.etdReason') === 'lost' || _.get(data, 'sessionData.EtdReasonForm.etdReason') === 'stolen') ? getWhatHappenedToPassport(_.get(data, 'sessionData.CircumstancesOfLossForm.passportLifeStory')) : null,
            "whatHappenedOther": _.get(data, 'sessionData.CircumstancesOfLossForm.otherReason')
        },
        "payment": {
            "method": getPaymentOption( _.get(data, 'sessionData.PaymentOptionsForm.paymentOption')),
            "reference": _.get(data, 'sessionData.PaymentOptionsForm.paymentReference')
        },
        "representative": {
            "birthCountryName": _.get(data, 'sessionData.BehalfApplyingForm.countryOfBirthCasebooklabel'),
            "birthdate": dateConvert(_.get(data, 'sessionData.BehalfApplyingForm.birthDate')),
            "birthTown": _.get(data, 'sessionData.BehalfApplyingForm.placeOfBirth'),
            "firstName": _.get(data, 'sessionData.BehalfApplyingForm.firstName'),
            "lastName": _.get(data, 'sessionData.BehalfApplyingForm.lastName'),
            "passportNumber": _.get(data, 'sessionData.BehalfApplyingForm.passportNumber'),
            "reasonForApplying":  _.get(data, 'sessionData.BehalfApplyingForm.reason'),
            "reasonForApplyingOther":_.get(data, 'sessionData.BehalfApplyingForm.otherReason'),
            "relationshipToApplicant": getRelationshipToApplicant(_.get(data, 'sessionData.BehalfApplyingForm.relationship')),
            "title": _.get(data, 'sessionData.BehalfApplyingForm.title')
        }
    })
}

messageTypes.generatePaymentUpdate = function (paymentMethod, etdReference, collectionMethod) {
    var getPaymentOption = function (PaymentOption) {
        switch (PaymentOption) {
            case 'online':
                return 'ONLINE'
            case 'offline':
                return 'OFFLINE'
            case 'thirdParty':
                return 'THIRD_PARTY'
        }
    }

    var removeEmptyKeysFromObject = function (obj) {
        Object.keys(obj).forEach(key => {
            if (Object.prototype.toString.call(obj[key])  ===  '[object Date]' && obj[key].toString().length === 0) {
                delete obj[key];
            } else if (obj[key] && typeof obj[key] === 'object') {
                removeEmptyKeysFromObject(obj[key]);
            } else if (obj[key] == null || obj[key] === "") {
                delete obj[key];
            }

            if (obj[key] && typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0 && Object.prototype.toString.call(obj[key])  !==  '[object Date]') {
                delete obj[key];
            }

        });
        return obj;
    }

    return removeEmptyKeysFromObject({
        "payment": {
            "method": getPaymentOption(paymentMethod),
            "reference": paymentMethod === 'online' ? etdReference : ''
        },
        "collectionInfo": {
            "collectionStatus": paymentMethod === 'online' && collectionMethod === 'COURIER_DELIVERY' ? 'PAYMENT_MADE' : ''
        }
    })
}

messageTypes.generateCourierCollectionInfo = function (CourierDeliveryAddressForm, collectionMethod, courierInfo) {

    // TODO: Used in lots of places. Can we extract & centralise?
    var removeEmptyKeysFromObject = function (obj) {
        Object.keys(obj).forEach(key => {
            if (Object.prototype.toString.call(obj[key]) === '[object Date]' && obj[key].toString().length === 0) {
                delete obj[key];
            } else if (obj[key] && typeof obj[key] === 'object') {
                removeEmptyKeysFromObject(obj[key]);
            } else if (obj[key] == null || obj[key] === "") {
                delete obj[key];
            }
            if (obj[key] && typeof obj[key] === 'object'
                && Object.keys(obj[key]).length === 0
                && Object.prototype.toString.call(obj[key]) !== '[object Date]') {
                delete obj[key];
            }
        });
        return obj;
    }

    return removeEmptyKeysFromObject({
        collectionInfo: {
            collectionMethod: collectionMethod,
            buildingName: CourierDeliveryAddressForm.buildingName,
            deliveryAddressLine1: CourierDeliveryAddressForm.streetNumberAndName,
            deliveryAddressLine2: CourierDeliveryAddressForm.addressLine2,
            deliveryAddressLine3: CourierDeliveryAddressForm.addressLine3,
            cityOrTown: CourierDeliveryAddressForm.town,
            country: courierInfo.countryCode,
            postcode: CourierDeliveryAddressForm.postcode,
            collectionStatus: 'PENDING_PAYMENT',
            courierBandedPrice: courierInfo.courierBandedPrice,
            currency: courierInfo.currency,
            productCode: courierInfo.productCode
        },
    })
}

module.exports = messageTypes
