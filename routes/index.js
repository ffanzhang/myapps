var express = require('express');
var path = require('path');
var router = express.Router();
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var crypto = require('crypto');
var Promise = require('bluebird');
var octicons = require('octicons');

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

var execPython = function(version, filename, inputfilename, executablename, foldername, res) {
  var cmd = 'python3';
  if (version == 2) {
    cmd = 'python';
  }
  var cmdstring = cmd + ' ' +  filename + ' < ' + inputfilename;
  var python = exec(cmdstring);
  var output = '';
  python.stdout.on('data', function(out) {
    output += String(out);
  });
  python.stderr.on('data', function(out) {
    output += String(out);
  });
  python.on('close', function(out) {
    exec('rm -rf ' + foldername);
    res.send(output);
  });
}

var execCFamily = function(version, filename, inputfilename, executablename, foldername, res) {
  var cmd = 'g++';
  if (version == 'gcc') {
    cmd = 'gcc';
  }
  var clike;
  if (cmd == 'gcc') {
    clike = spawn(cmd, [filename, '-o', executablename]);
  } else {
    clike = spawn(cmd, [filename, '--std=c++11', '-o', executablename]);
  }
  var output = '';
  clike.stdout.on('data', function(out) {
    output += String(out);
  });
  clike.stderr.on('data', function(out) {
    output += String(out);
  });
  clike.on('close', function(data) {
    if (data === 0) {
      var run = exec('./' + executablename + ' < ' + inputfilename);
      run.stdout.on('data', function(out) {
        output += String(out);
      });
      run.stderr.on('data', function(out) {
        output += String(out);
      });
      run.on('close', function(out) {
        exec('rm -rf ' + foldername);
        res.send(output);
      });
    } else {
      res.send(output);
    }
  });
}

router.post('/ide', function(req, res, next) {
  var source = req.body.code;
  var input = req.body.input;
  var compiler = req.body.compiler;
  var foldername = path.join("tmp", crypto.randomBytes(16).toString('hex'));
  var filename = crypto.randomBytes(32).toString('hex');
  var inputfilename = crypto.randomBytes(32).toString('hex') + '.txt';
  var executablename = crypto.randomBytes(32).toString('hex');
  filename = path.join(foldername, filename);
  inputfilename = path.join(foldername, inputfilename);
  executablename = path.join(foldername, executablename);

  if (compiler == 'gcc') {
    filename += '.c';
  } else if (compiler == 'g++') {
    filename += '.cc';
  } else {
    filename += '.py';
  }
  if (!fs.existsSync('tmp')) {
    execSync('mkdir tmp');
  }
  execSync('mkdir ' + foldername);
  execSync('touch ' + filename);
  execSync('touch ' + inputfilename);

  fs.writeFileSync(filename, source);
  fs.writeFileSync(inputfilename, input);

  if (compiler === 'python3') {
    execPython(3, filename, inputfilename, executablename, foldername, res);
  } else if (compiler == 'python') {
    execPython(2, filename, inputfilename, executablename, foldername, res);
  } else if (compiler === 'gcc') {
    execCFamily('gcc', filename, inputfilename, executablename, foldername, res);
  } else if (compiler === 'g++') {
    execCFamily('g++', filename, inputfilename, executablename, foldername, res);
  } else {
    execPython(2, filename, inputfilename, executablename, foldername, res);
  }
});

module.exports = router;
