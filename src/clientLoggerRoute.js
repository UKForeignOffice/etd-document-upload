'use strict';

var express = require('express')
var clientLogger = require('./clientLogger')

var router = express.Router()

router.post('/log', clientLogger)

module.exports = router