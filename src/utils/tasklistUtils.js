'use strict';

var _ = require('lodash')
var config = require('config')
var logger = require('./logs/logger').getLogger('Task list Utils')
var moment = require('moment')

var tasks = [
    {
        taskName: "ELIGIBILITY",
        taskLabelStatic: "Confirm eligibility to apply online",
        taskLabel: "Start Confirm eligibility to apply online",
    },
    {
        taskName: "APPLICATION_DETAILS",
        taskLabelStatic: "Add application details",
        taskLabel: "Start application details",
    },
    {
        assetType: "Birth certificate",
        taskName: "BIRTH_CERTIFICATE",
        taskLabelStatic: "Add birth certificate",
        taskLabel: "Add birth certificate",
        category: 'document',
        heading: 'birth certificate'
    },
    {
        assetType: "Adult application",
        taskName: "ADULT_APPLICATION",
        taskLabelStatic: "Add adult ETD application",
        taskLabel: "Add adult ETD application",
        category: 'document',
        heading: 'adult ETD application'
    },
    {
        assetType: "Proof of payment",
        taskName: "MONEY_RECEIPT",
        taskLabelStatic: "Add proof of payment",
        taskLabel: "Add proof of payment",
        category: 'document',
        heading: 'proof of payment'
    },
    {
        assetType: "Other",
        taskName: "OTHER",
        taskLabelStatic: "Add other document type",
        taskLabel: "Add other document type",
        category: 'document',
        heading: 'supporting document'
    },
    {
        assetType: "Other form of ID",
        taskName: "OTHER_FORM_OF_ID",
        taskLabelStatic: "Add form of ID",
        taskLabel: "Add form of ID",
        category: 'document',
        heading: 'other form of ID'
    },
    {
        assetType: "Parental consent letter",
        taskName: "PARENTAL_CONSENT_LETTER",
        taskLabelStatic: "Add consent letter",
        taskLabel: "Add consent letter",
        category: 'document',
        heading: 'parental consent letter',
        text: 'All those with parental responsibility should attend the appointment with the applicant, even if they are not travelling with the child. If any of those with parental responsibility can\'t attend we need to see a signed consent letter from each of them. It is important that we are able to see the parent\'s signature and date of signature on the consent letter'
    },
    {
        assetType: "Photo",
        taskName: "PHOTO_IMAGE",
        taskLabelStatic: "Add a photo",
        taskLabel: "Add a photo",
        category: 'photo'
    },
    {

        taskName: "DELIVERY_SELECTION",
        taskLabelStatic: "Find out delivery and collection options",
        taskLabel: "Select",
        category: 'delivery'
    },
    {
        taskName: "PAYMENT",
        taskLabelStatic: "Choose how to pay for your emergency travel document",
        taskLabel: "Payment",
    },
    {
        taskName: "DOCUMENT",
        taskLabelStatic: "Upload your document",
        taskLabel: "Document",
    },
    {
        assetType: "Proof of passport",
        taskName: "PROOF_OF_PASSPORT",
        taskLabelStatic: "Add a photo of your passport",
        taskLabel: "Add a photo of your passport",
        category: 'document',
        heading: 'passport page',
        text: 'Add a photo of the main page of your British passport - the page with the passport photo. We accept almost all file formats and sizes.',
        bulletPointsIntro: 'In addition:',
        bulletPoints: 'If your passport has been damaged, add a photo of the damage too (if it is not apparent on the main photo page).'
    },
    {
        assetType: "Proof of residency",
        taskName: "PROOF_OF_RESIDENCE",
        taskLabelStatic: "Add proof of residency",
        taskLabel: "Add your proof of residency",
        category: 'document',
        heading: 'proof of residency',
        text: 'Add a photo or digital copy of your proof of residency. We accept almost all file formats and sizes.',
        bulletPointsIntro: 'We accept these types of proof:',
        bulletPoints: 'your permanent resident card | your ID card | your visa'
    },
    {
        assetType: "Proof of Hong Kong ID",
        taskName: "PROOF_OF_HONG_KONG_ID",
        taskLabelStatic: "Add a photo of your Hong Kong ID card",
        taskLabel: "Add a photo of your ID card",
        category: 'document',
        heading: 'Hong Kong ID card',
        text: 'Add a photo of your Hong Kong identity card. We accept almost all file formats and sizes.',
        bulletPointsIntro: 'We need a photo or scan of the front and back of your card.'
    },
    {
        assetType: "Proof of travel",
        taskName: "PROOF_OF_TRAVEL",
        taskLabelStatic: "Add a copy of your travel booking",
        taskLabel: "Add your travel booking",
        category: 'document',
        heading: 'travel booking',
        text: 'Add a copy of your travel booking, such as travel tickets or booking confirmations. We accept almost all file formats and sizes. If you have been emailed the travel booking, you may find it easier to take a screenshot.',
        bulletPointsIntro: 'You must show these details',
        bulletPoints: 'your name | travel date | origin | destination'
    },
    {
        assetType: "Signature",
        taskName: "SIGNATURE",
        taskLabelStatic: "Add signature",
        taskLabel: "Add signature",
        category: 'document',
        heading: 'signature'
    },
    {
        assetType: "Claim to nationality",
        taskName: "CLAIM_TO_NATIONALITY",
        taskLabelStatic: "Add claim to nationality",
        taskLabel: "Add claim to nationality",
        category: 'document',
        heading: 'claim to nationality'
    },
    {
        assetType: "Parent's passport",
        taskName: "PASSPORT_OF_PARENT",
        taskLabelStatic: "Add parent's passport",
        taskLabel: "Add parent's passport",
        category: 'document',
        heading: 'photo/scan of parents\' passport pages',
        text: 'We need to see the page of each parent\'s passport that shows their personal details including photo'
    },
    {
        assetType: "Short interview form",
        taskName: "SHORT_INTERVIEW_FORM",
        taskLabelStatic: "Add short interview form",
        taskLabel: "Add short interview form",
        category: 'document',
        heading: 'short interview form'
    },
    {
        assetType: "FTA form",
        taskName: "FIRST_TIME_APPLICATION_FORM",
        taskLabelStatic: "Add first-time interview form",
        taskLabel: "Add first-time interview form",
        category: 'document',
        heading: 'first-time application form'
    },
    {
        assetType: "Child application",
        taskName: "CHILD_APPLICATION",
        taskLabelStatic: "Add child ETD application",
        taskLabel: "Add child ETD application",
        category: 'document',
        heading: 'child ETD application'
    },
    {
        assetType: "DVA check",
        taskName: "DVA_CHECK",
        taskLabelStatic: "Add DVA check",
        taskLabel: "Add DVA check",
        category: 'document',
        heading: 'DVA check'
    },
    {
        taskName: "BLANK",
        taskLabelStatic: "",
        taskLabel: ""
    },
    {
        taskName: "COLLECT_DOCUMENT",
        taskLabelStatic: "Find out where to collect your document",
        taskLabel: "Collect Document"
    },
    {
        taskName: "BOOK_APPOINTMENT",
        taskLabelStatic: "Book Appointment",
        taskLabel: "Book appointment"
    },
    {
        taskName: "COMPLETE_APPLICATION",
        taskLabelStatic: "Submit application",
        taskLabel: "Submit Application"
    },

    //part 2 of change FCO0733 - MC
    // {
    //     taskName: "NEW_DATES",
    //     taskLabelStatic: "Enter your new travel details",
    //     taskLabel: "Enter dates"
    // },
    {
        taskName: "COMPLETE_APPLICATION",
        taskLabelStatic: "Submit application",
        taskLabel: "Submit Application"
    },
    {
        assetType: "Proof of original travel",
        taskName: "PROOF_OF_ORIGINAL_TRAVEL",
        taskLabelStatic: "Add a copy of your original travel booking",
        taskLabel: "Add a copy of your travel booking",
        category: 'document',
        heading: 'travel booking',
        text: 'Add a copy of your travel booking, such as travel tickets or booking confirmations. We accept almost all file formats and sizes. If you have been emailed the travel booking, you may find it easier to take a screenshot.',
        bulletPointsIntro: 'You must show these details',
        bulletPoints: 'your name | travel date | origin | destination'
    },
    {
        assetType: "Travel itinerary",
        taskName: "TRAVEL_ITINERARY",
        taskLabelStatic: "Add a copy of your journey details",
        taskLabel: "Add a copy of your journey details",
        category: 'document',
        heading: 'journey details',
        text: 'Add a copy of your journey details with dates and locations. We need to confirm your travel plans. If you are taking multiple flights (even within the same country), provide full details. Your travel details (confirmed or intention) will be included in your Emergency Travel Document. You will need to follow this stated plan.',
        bulletPointsIntro: 'If you are yet to book, or unable to do so, confirm your intentions for the following:',
        bulletPoints: 'Departure location | Departure date and time | Method(s) of travel | All departure journey transit countries (if applicable) | Destination location | Arrival date and time',
        bulletType: 'list-number',
        bulletPointsOutro: 'Repeat points 1-6 if you\'re making a return journey.'
    }
]

var statusList = [
    'NOT_STARTED',
    'NOT_APPLICABLE',
    'IN_PROGRESS',
    'COMPLETED',
    'UNKNOWN',
    'FRIEND',
    'OFFLINE',
    'SELF_COLLECT',
    'COURIER_DELIVERY'
]

var completedStatusList = [
    'COMPLETED',
    'FRIEND',
    'OFFLINE',
    'NOT_APPLICABLE',
    'SELF_COLLECT',
    'COURIER_DELIVERY'
]

function getTask(taskNameValue) {
    var matchingTasks = tasks.filter(function (o) {
        return o.taskName === taskNameValue
    })
    return (Array.isArray(matchingTasks) && matchingTasks.length > 0) ? matchingTasks[0] : null
}

var getTaskLabel = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return matchingTask ? matchingTask.taskLabel : ''
}

var getTaskLabelStatic = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return matchingTask ? matchingTask.taskLabelStatic : ''
}

var getTasklist = function () {
    return _.map(tasks, function (task) {
        return task.taskName
    })
}

var getTaskNamesForCategory = function (category) {
    var categoryTaskNames = tasks.filter(function (o) {
        return (o.category === category)
    })
    return _.map(categoryTaskNames, function (task) {
        return task.taskName
    })
}

var getTaskName = function (assetTypeName) {
    var matchingTasks  = tasks.filter(function(o) {
        return o.assetType === assetTypeName
    })
    return (Array.isArray(matchingTasks) && matchingTasks.length > 0) ? matchingTasks[0].taskName : null
}

var getTaskAssetType = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return matchingTask ? matchingTask.assetType : ''
}

var getTaskCategory = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return matchingTask ? matchingTask.category : ''
}

var getTaskHeading = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return matchingTask ? matchingTask.heading : null
}

var getTaskText = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return (matchingTask) ? matchingTask.text : null
}

var getBulletPoints = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return (matchingTask) ? matchingTask.bulletPoints : null
}

var getBulletPointsIntro = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return (matchingTask) ? matchingTask.bulletPointsIntro : null
}

var getBulletListType = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return (matchingTask && matchingTask.bulletType) ? matchingTask.bulletType : 'list-bullet'
}

var getBulletPointsOutro = function (taskNameValue) {
    var matchingTask = getTask(taskNameValue);
    return (matchingTask) ? matchingTask.bulletPointsOutro : null
}

var generateTasklistInfoData = function (props) {
    var expiryTime = new Date(Date.now() + (config.server.redis.tasklist.ttl * 1000))
    var defaultProps = {
        reference: null,
        referenceType: 'ETDONLINE',
        firstName: null,
        requiredItems: null,
        additionalItems: null,
        currentCountry: null,
        expiryDateTime: expiryTime,
        paymentProviderUkPay: 'N',
        courierSupport: null,
        postLabel: ''
    }

    props = Object.assign(defaultProps, props)

    return {
        reference: props.reference,
        referenceType: props.referenceType,
        firstName: props.firstName,
        expiryDateTime: props.expiryDateTime,
        requiredItems: (Array.isArray(props.requiredItems)) ? props.requiredItems.join(',') : '',
        additionalItems: (Array.isArray(props.additionalItems)) ? props.additionalItems.join(',') : '',
        paymentProviderUkPay: props.paymentProviderUkPay,
        postLabel: props.postLabel,
        courierSupport: props.courierSupport,
        currentCountry: props.currentCountry
    }
}

var generateTasklistTaskData = function (props) { //TODO:   should call this to create a task with status we are intrested in,
    var defaultProps = {
        taskName: null,
        status: statusList['NOT_STARTED']
    }

    props = Object.assign(defaultProps, props)

    if (getTasklist().indexOf(props.taskName) === -1 || statusList.indexOf(props.status) === -1) {
        return null
    }

    return {
        taskName: props.taskName,
        status: props.status
    }
}

function olderThanXDays(dateStringUKFormat, days) {
    var splitDate = dateStringUKFormat.split('-');
    var dateGiven = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]) // Javascript months are 0-11
    var dateDaysAgo = new Date(new Date().setDate(new Date().getDate() - days))
    return (dateGiven < dateDaysAgo)
}

var generateRequiredTasks = function (sessionData, countryData, postData) {

    // default required tasks
    var requiredTasks = ['ELIGIBILITY', 'APPLICATION_DETAILS', 'PHOTO_IMAGE', 'PAYMENT']
    var formattedDob = moment(_.get(sessionData, 'NameForm.birthDate') , 'DD-MM-YYYY')
    var applicantAge = moment().diff(formattedDob, 'years');

    if (_.includes(['expired', 'full', 'defacedDamaged'], _.get(sessionData, 'EtdReasonForm.etdReason'))) {
        requiredTasks.push('PROOF_OF_PASSPORT')
    }

    if (_.get(sessionData, 'BritishCitizenForm.isBritishCitizen') !== 'Y') {
        requiredTasks.push('PROOF_OF_HONG_KONG_ID')
    }

    if (_.get(sessionData, 'TellusJourneyForm.haveTravelBooked') === 'Y') {
        requiredTasks.push('PROOF_OF_TRAVEL')
    }

    if ((_.get(sessionData, 'TellusNoTravelForm.notravelReason') === 'I have missed my previously booked travel')
    ) {
        requiredTasks.push('PROOF_OF_ORIGINAL_TRAVEL')
        //part 2 of change FCO0733 - MC - requiredTasks.push('NEW_DATES')
    }
    if ((_.get(sessionData, 'TellusNoTravelForm.notravelReason') === 'My booked travel is within the next 48 hours')
    ) {
        requiredTasks.push('PROOF_OF_ORIGINAL_TRAVEL')
        //part 2 of change FCO0733 - MC requiredTasks.push('NEW_DATES')
    }

    if (_.get(countryData, 'skipTravelAdvice') === 'false') {
        if (_.get(sessionData, 'BritishNationalOverseasForm.isBritishNationalOverseas') === 'Y' && _.get(sessionData, 'JourneyDetailsForm.destinationCountry') === 'Hong Kong') {
            // do nothing
        }
        else {
            requiredTasks.push('PROOF_OF_RESIDENCE')
        }
    }

    logger.info("Applicant Age: " , applicantAge)
    if (_.get(postData, 'pilot.standard') === 'Y' || uploadOnlyPost(postData, sessionData) ||
        (applicantAge < 16) ||
        (
        _.get(sessionData, 'EtdReasonForm.etdReason') === 'expired' && (
            !_.get(sessionData, 'PassportDetailsForm.passportExpiryDate') ||
            olderThanXDays(_.get(sessionData, 'PassportDetailsForm.passportExpiryDate'), 270)
        ))) {
        requiredTasks.push('BOOK_APPOINTMENT')
    }
    else if(_.get(sessionData, 'BritishNationalOverseasForm.isBritishNationalOverseas') === 'Y' ) {
        if(isUnitedKingdomPartOfJourney(sessionData)) {
            requiredTasks.push('BOOK_APPOINTMENT')
        }
        else {
            requiredTasks.push('COLLECT_DOCUMENT')
        }
    }
    else {
        requiredTasks.push('COLLECT_DOCUMENT')
    }

    return requiredTasks
}

    var uploadOnlyPost = function (postData, sessionData) {
        if(_.get(postData, 'pilot.photoDocUpload') === 'Y' && _.get(postData, 'pilot.signonreceipt') === 'Y' && _.get(postData, 'pilot.standard') === 'Y') {
            return true
        }
        return false
    }

    var isUnitedKingdomPartOfJourney = function (sessionData) {
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

module.exports = {
    generateTasklistInfoData: generateTasklistInfoData,
    generateTasklistTaskData: generateTasklistTaskData,
    statusList: statusList,
    completedStatusList: completedStatusList,
    generateRequiredTasks: generateRequiredTasks,
    getTaskLabel: getTaskLabel,
    getTaskLabelStatic: getTaskLabelStatic,
    getTasklist: getTasklist,
    getTaskNamesForCategory: getTaskNamesForCategory,
    getTaskName: getTaskName,
    getTaskAssetType: getTaskAssetType,
    getTaskCategory: getTaskCategory,
    getTaskHeading: getTaskHeading,
    getTaskText: getTaskText,
    getBulletPoints: getBulletPoints,
    getBulletPointsIntro: getBulletPointsIntro,
    getBulletListType: getBulletListType,
    getBulletPointsOutro: getBulletPointsOutro
}
