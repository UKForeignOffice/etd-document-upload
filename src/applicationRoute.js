'use strict';

var {app} = require('./server')
var express = require('express')

var documentUploadLink = require('./documentUploadLink')

// TODO: Remove this line after 15th May 2018 (AEI-493)
var uploadLink = require('./uploadLink')

var {documentSend, documentUpload} = require('./documentHandle')
var Global = require('./component/Global')
var upload = require('multer')({
    dest: Global.getConfig().server.virusScanner.uploadDir,
    limits: {
        filzeSize: Global.getConfig().server.imageStorage.maxFileSize
    }
});

var router = express.Router()

app.use(router)

router.get('/doc/:hash', documentUploadLink)
router.get('/doc', documentUploadLink)
router.post('/documentUpload', upload.array('documents'), documentUpload)
router.post('/documentSend', documentSend)

// TODO: Remove this line after 15th May 2018 (AEI-493)
router.get('/link/:hash', uploadLink)

module.exports = router
