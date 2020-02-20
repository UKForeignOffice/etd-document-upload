'use strict';

var express = require('express')
var router = express.Router()

var {createSession, deleteSession, postSessionForm, pdfStashedData, updateSession, getSessionForm, getSessionFormByFormName, getAppStatus, deleteSessionFormByFormName} = require('./api')
var {getTravelAdviceForCountries} = require('./component/TravelAdviceData')
var {createTasklist, deleteTasklist, updateTasklist, getTasklistTokenFromRef, getTasklist} = require('./tasklistApi')

router.post('/session', createSession )
router.delete('/session/:token', deleteSession )
router.post('/session/:token/form/:formName', postSessionForm )
router.post('/session/:token/pdfStash', pdfStashedData )
router.post('/session/:token/update', updateSession )
router.get('/session/:token/form', getSessionForm )
router.get('/session/:token/form/:formName', getSessionFormByFormName )
router.get('/healthcheck', getAppStatus)
router.delete('/session/:token/form', deleteSessionFormByFormName )
router.get('/advice', getTravelAdviceForCountries )

router.post('/tasklist', createTasklist)
router.delete('/tasklist/:tasklistToken', deleteTasklist)
router.post('/tasklist/:tasklistToken/form/:formName', updateTasklist)
router.get('/tasklist/:tasklistToken', getTasklist)
router.get('/tasklist/find/:hash', getTasklistTokenFromRef)

module.exports = router
