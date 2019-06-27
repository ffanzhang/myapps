const express = require('express');
const router = express.Router();
const request = require('request');
const octicons = require('octicons');
const ProgramRunnerService = require('../models/ProgramRunnerService');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fan\'s Apps' });
});

router.get('/codeforcesqp', function(req, res, next) {
  res.render('codeforcesqp');
});

router.get('/ide', function(req, res, next) {
  res.render('ide', { settings_icon : octicons.gear.toSVG() });
});

let handle_error = function(e) {
  console.log(e);
}

router.post('/ide', function(req, res, next) {
    ProgramRunnerService.dispatch(req, res);
});

module.exports = router;
