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
const ProgramRunner = require('../models/ProgramRunner');

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
  let source = req.body.code;
  let input = req.body.input;
  let compiler = req.body.compiler;

  if (compiler === 'python3') {
    ProgramRunner.run('python3', ['-c', source], input, function(out, data) {
      res.send(out);
    });
  } else if (compiler == 'python') {
    ProgramRunner.run('python', ['-c', source], input, function(out, data) {
      res.send(out);
    });
  } else if (compiler === 'gcc') {
    files = make_files(source, '.c');
    foldername = files[0];
    filename = files[1];
    executablename = files[2];
    ProgramRunner.run('gcc', [filename, '-o', executablename], input, function(out, data) {
      if (data == 0) {
        ProgramRunner.run('./' + executablename, [], input, function(out, data) {
          cleanup(foldername, filename, executablename);
          res.send(out);
        });
      } else {
        cleanup(foldername, filename, executablename);
        res.send(out);
      }
    });
  } else if (compiler === 'g++') {
    files = make_files(source, '.cc');
    foldername = files[0];
    filename = files[1];
    executablename = files[2];
    ProgramRunner.run('g++', [filename, '--std=c++11', '-o', executablename], input, function(out, data) {
      if (data == 0) {
        ProgramRunner.run('./' + executablename, [], input, function(out, data) {
          cleanup(foldername, filename, executablename);
          res.send(out);
        });
      } else {
        cleanup(foldername, filename, executablename);
        res.send(out);
      }
    });
  } else {
    ProgramRunner.run('python', ['-c', source], input, function(out) {
      res.send(out);
    });
  }
});

module.exports = router;
