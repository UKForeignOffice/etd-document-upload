'use strict'

var async = require('async')
var RestClient = require('./utils/RestClient')
var binaryParser = require('superagent-binary-parser')
var Global = require('./component/Global')
var logger = require('./utils/logs/logger').getLogger('documentUpload')
var SuperagentHeadersPlugin = require('./component/SuperagentHeadersPlugin')
var getErrorMessage = require('./utils/genericUtils')
var _ = require('lodash')
var tasklistUtils = require('./utils/tasklistUtils')
var sendMessage = require('./utils/sendMessage')
var messageTypes = require('./utils/messageTypes')
var fs = require('fs')

// Anti-virus
var virusScanEnabled = Global.getConfig().server.virusScanner.enabled
if (virusScanEnabled) {
    var clam = require('clamscan')({
        remove_infected: true,
        scan_recursively: false,
        debug_mode: Global.getConfig().server.virusScanner.debugMode,
        scan_log: Global.getConfig().server.virusScanner.scanLog,
        clamdscan: {
            path: Global.getConfig().server.virusScanner.path,
            config_file: Global.getConfig().server.virusScanner.config,
            multiscan: true,
            reload_db: false,
            active: true
        },
    })
}

var transformErrorCodes = function (errorCode) {
    switch (errorCode) {
        case 'session-not-found':
        case 'missing-session':
        case 'missing-task':
        case 'invalid-task':
        case 'max-combined-size-exceeded':
        case 'max-single-size-exceeded':
        case 'file-type-not-permitted':
        case 'file-checks-error':
        case 'file-checks-failed':
            return errorCode
        default:
            logger.info("Document Handle Untransformed error-code: ", errorCode)
            return 'generic-error'
    }
}

var documentUpload = function (request, response) {
    logger.info("Document submitted for upload")
    var inputFiles = request.files
    //var token = request.cookies['accessToken']
    var assetType = request.query.type

    async.waterfall([

            // Verify the session data
            // function (callback) {
            //
            //     var data = {
            //         assetType: null,
            //         documents: [],
            //         sessionData: null
            //     }
            //
            //     if (typeof (token) === 'undefined') {
            //         callback('session-not-found', null)
            //     }
            //     else {
            //         RestClient()
            //             .get(Global.getSessionApiBaseUrl(token) + '/form')
            //             .use(SuperagentHeadersPlugin)
            //             .end((err, res) => {
            //                 if (err || res.serverError || res.clientError) {
            //                     callback(res.body, null)
            //                 }
            //                 else {
            //                     data.sessionData = res.body
            //                     if(data.sessionData.UploadData.reference) {
            //                         callback(null, data)
            //                     }
            //                     else{
            //                         logger.info("No ETD ref has been supplied")
            //                         try {
            //                             logger.info("Data supplied = " , res.body)
            //                         }
            //                         catch(e) {
            //                             logger.error("can't return session: " , e)
            //                         }
            //                         callback('session-not-found', null)
            //                         return
            //                     }
            //                 }
            //             })
            //     }
            // },

            // Verify uploadable file type
            function ( callback) {
                if (!assetType) {
                    callback('missing-task', data)
                    return
                }
                if (tasklistUtils.getTasklist().indexOf(assetType) === -1) {
                    callback('invalid-task', data)
                    return
                }

                var data = { assetType: assetType }
                callback(null, data)
            },
            //
            // // Verify combined max file sizes
            // function (data, callback) {
            //     var totalSize = 0
            //     _.forEach(inputFiles, function (inputFile) {
            //         totalSize += inputFile.size
            //     })
            //     if (totalSize > Global.getConfig().server.documentStorage.maxCombinedFileSize) {
            //         callback('max-combined-size-exceeded', data)
            //     } else {
            //         callback(null, data)
            //     }
            // },

            // Verify individual max file sizes
            function (data, callback) {
                var invalidFiles = false
                _.forEach(inputFiles, function (inputFile) {
                    if (inputFile.size > Global.getConfig().server.documentStorage.maxSingleFileSize) {
                        invalidFiles = true
                    }
                })
                if (invalidFiles) {
                    callback('max-single-size-exceeded', data)
                } else {
                    callback(null, data)
                }
            },

            // Verify document type
            function (data, callback) {
                var invalidFiles = false
                _.forEach(inputFiles, function (inputFile) {
                    if (!inputFile.originalname.toLowerCase().match(/\.(doc|docx|pdf|jpg|jpeg|png|gif)$/)) {
                        invalidFiles = true
                    }
                })
                if (invalidFiles) {
                    callback('file-type-not-permitted', data)
                } else {
                    callback(null, data)
                }
            },
            //
            // // Virus Scan Upload
            // function (data, callback) {
            //     if (virusScanEnabled) {
            //         logger.debug("Initiating virus scans")
            //         var filePaths = _.map(inputFiles, function (inputFile) {
            //             return inputFile.path
            //         })
            //         clam.scan_files(filePaths, function (err, goodFiles, badFiles) {
            //             if (err) {
            //                 logger.error("Error performing virus scans", err)
            //                 callback('file-checks-error', data)
            //                 return
            //             }
            //
            //             if (badFiles.length > 0) {
            //                 logger.error("One or more files failed virus scan checks")
            //                 callback('file-checks-failed', data)
            //             } else {
            //                 logger.info("Virus scans passed for all files")
            //                 callback(null, data)
            //             }
            //         }, function (err, file, is_infected) {
            //             if (is_infected) {
            //                 logger.error("Virus scan failed on file: ", file)
            //             } else {
            //                 logger.debug("Virus scan passed on a file: ", file)
            //             }
            //         })
            //     } else {
            //         logger.warn("Virus scanning disabled")
            //         callback(null, data)
            //     }
            // },

            // // Document & image processor
            // function (data, callback) {
            //     var documentPromises = _.map(inputFiles, function (inputFile, key) {
            //         return processDocument(inputFile, key)
            //     })
            //
            //     Promise.all(documentPromises).then(function (documents) {
            //         data.documents = documents
            //         callback(null, data)
            //     }).catch(function (err) {
            //         callback(err, data)
            //     })
            // },
            //
            // // Send to queue
            // function (data, callback) {
            //     _.forEach(inputFiles, function (inputFile, key) {
            //         var reference = messageTypes.generateSystemReference({
            //             systemReference: _.get(data, 'sessionData.UploadData.reference'),
            //             systemReferenceType: _.get(data, 'sessionData.UploadData.referenceType')
            //         })
            //
            //         var message = messageTypes.etdAssetMessageType({
            //             assetType: tasklistUtils.getTaskAssetType(data.assetType),
            //             assetMIMEType: data.documents[key].mimeType,
            //             assetContext: _.get(data, 'sessionData.UploadData.context'),
            //             dataString: new Buffer(data.documents[key].buffer).toString('base64'),
            //             refs: [reference]
            //         })
            //
            //         var otherTypeDescription = _.get(data, 'sessionData.UploadData.otherTypeDescription');
            //         if (otherTypeDescription) {
            //             logger.debug(`Got other type description rom session: ${otherTypeDescription}`)
            //             message.etdAsset.assetOtherTypeDescription = otherTypeDescription
            //         }
            //         logger.info('sending etdAsset message with ref: ' + _.get(message, 'etdAsset.refs[0].systemReference') + ' and guid: ' + _.get(message, 'etdAsset.guid'))
            //
            //         try {
            //             logger.info("Document Handle: Trying sendMessage")
            //             sendMessage(message, 'etdAsset')
            //             callback(null, data)
            //         }
            //         catch (e){
            //             logger.info("Error on sendMessage", e)
            //             callback(null, data)
            //         }
            //     })
            // },

            // // Email Post if an ETD Online Reference
            // function (data, callback) {
            //     var systemReferenceType = _.get(data, 'sessionData.UploadData.referenceType')
            //
            //     if (systemReferenceType && systemReferenceType === 'ETDONLINE') {
            //         var DocUploadSuccessData = {
            //             etdOnlineRef: _.get(data, 'sessionData.UploadData.reference'),
            //             casebookRef: _.get(data, 'sessionData.stashedSessionData.CasebookForm.casebookReference'),
            //             documentType: data.assetType,
            //             otherDocumentTypeDescription: _.get(data, 'sessionData.UploadData.otherTypeDescription'),
            //             firstName: _.get(data, 'sessionData.UploadData.firstName'),
            //             lastName: _.get(data, 'sessionData.stashedSessionData.NameForm.applicantLastName')
            //         }
            //
            //         RestClient()
            //             .post(Global.getConfig().server.sendEmailDocumentUploadSuccessUrl)
            //             .send(DocUploadSuccessData)
            //             .end((err, res) => {
            //                 if (err || res.serverError || res.clientError) {
            //                     callback({type: 'docUploaded', error: err || res.body}, data)
            //                 }
            //                 else {
            //                     callback(null, data)
            //                 }
            //             })
            //     } else {
            //         callback(null, data)
            //     }
            // },

            // // Update tasklist if one exists
            // function (data, callback) {
            //     var tasklistReference = _.get(data, 'sessionData.UploadData.tasklistReference')
            //     if (tasklistReference) {
            //         var taskData = {"taskName": data.assetType, "status": "COMPLETED"}
            //         RestClient()
            //             .post(Global.getTasklistApiBaseUrl(tasklistReference) + '/form/TaskListTaskForm')
            //             .use(SuperagentHeadersPlugin)
            //             .query({'ip': request.ip})
            //             .send(taskData)
            //             .end(function (err, res) {
            //                 if (err || res.status != 200) {
            //                     var error = getErrorMessage(err, res)
            //                     logger.info("error updating tasklist data store", error)
            //                     callback({type: 'tasklist-update', error: error}, data)
            //                 }
            //                 else {
            //                     logger.debug("Updated tasklist store")
            //                     callback(null, data)
            //                 }
            //             })
            //     } else {
            //         callback(null, data)
            //     }
            // }
        ],

        function (err, data) {
            _.forEach(inputFiles, function (inputFile) {
                if (fs.existsSync(inputFile.path)) {
                    fs.unlinkSync(inputFile.path)
                }
            })
            if (err) {
                logger.error("Error occurred uploading document", err)
                // Gateway blocks 400+ errors so return 200 with error-code to be handled by client
                response.status(200).send(transformErrorCodes(err.error))
                return
            }
            response.status(200).send('ok')
        }
    )
}

var processDocument = function (inputFile) {  // jshint ignore:line
    var document = {
        path: null,
        mimeType: null,
        error: null
    }
    if (inputFile.mimetype === 'application/pdf') {
        logger.info("item does not require processing")
        document.buffer = fs.readFileSync(inputFile.path)
        document.mimeType = 'application/pdf'
        return document
    } else if (Global.getConfig().server.documentProcessor.validMimeTypes.indexOf(inputFile.mimetype) > -1) {
        logger.info("sending to document processing service")
        return RestClient()
            .post(Global.getConfig().server.documentProcessor.url)
            .use(SuperagentHeadersPlugin)
            .attach('doc', inputFile.path, inputFile.originalname)
            .parse(binaryParser)
            .buffer()
            .then((res) => {
                logger.info("received document back from processing services")
                document.buffer = res.body
                document.mimeType = res.headers['content-type']
                return document
            })
            .catch((err) => {
                var errorMsg = getErrorMessage(err, res);
                logger.error("Error processing document", errorMsg)
                document.error = errorMsg
                return document
            })

    } else if (Global.getConfig().server.imageResizer.validMimeTypes.indexOf(inputFile.mimetype) > -1) {
        logger.info("sending to image processing service")
        return RestClient() // jshint ignore:line
            .post(Global.getConfig().server.imageResizer.url)
            .use(SuperagentHeadersPlugin)
            .attach('photo', inputFile.path, inputFile.originalname)
            .parse(binaryParser)
            .buffer()
            .then((res) => {
                logger.info("received image back from processing services")
                document.buffer = res.body
                document.mimeType = res.headers['content-type']
                return document
            })
            .catch((err) => {
                logger.error("Error processing image", err)
                document.error = err.message
                return document
            })
    } else {
        document.error = 'invalid file mimetype'
        return
    }
}

var documentSend = function (request, response) {
    //var url = Global.getConfig().server.sendEmailHowSupplyingDocumentUrl
    var assetType = request.query.type

    async.waterfall([
            // Verify uploadable file type
            function (callback) {
                var data = {assetType: assetType}
                if (!assetType) {
                    callback('missing-task', data)
                    return
                }
                //data.assetType = assetType
                callback(null, data)
            },
        ],
        function (err, data) {

            if (err) {
                logger.error('documentSend Error')
                switch (err) {
                    case 'missing-session':
                        response.status(404).send({error: 'missing-session'})
                        break
                    default:
                        response.status(500).send('generic-error')
                }
                return
            }

            if (!_.get(data, 'response')) {
                response.status(500).send('generic-error')
                return
            }
            response.status(200).send(data.response)
        }
    )
}

module.exports = {
    documentSend,
    documentUpload
}
