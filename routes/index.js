const express = require('express');
const path = require('path');
const router = express.Router();
const request = require('request');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const fs = require('fs');
const crypto = require('crypto');
const Promise = require('bluebird');
const octicons = require('octicons');
const ProgramRunnerService = require('../models/ProgramRunnerService');

const process_options = {
  cwd : '/tmp/',
  env : {
    PATH: process.env.PATH
  }
};

/* GET home page. */
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

let cleanup = function(foldername, filename, executablename) {
  execSync('rm -rf ' + foldername, process_options);
}

let make_files = function(source, ext) {
  let files = [];
  let foldername = path.join("tmpsrc", crypto.randomBytes(16).toString('hex'));
  let filename = path.join(foldername, crypto.randomBytes(32).toString('hex') + ext);
  let executablename = path.join(foldername, crypto.randomBytes(32).toString('hex'));

  if (!fs.existsSync(path.join('/tmp', 'tmpsrc'))) {
    execSync('mkdir tmpsrc', process_options);
  }

  execSync('mkdir ' + foldername, process_options);
  execSync('touch ' + filename, process_options);

  fs.writeFileSync(path.join('/tmp', filename), source);

  files.push(foldername);
  files.push(filename);
  files.push(executablename);
  return files;
};

router.post('/ide', function(req, res, next) {
    ProgramRunnerService.dispatch(req, res);
});

module.exports = router;
