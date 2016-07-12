var express = require('express');
var router = express.Router();
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fan\'s Apps' });
});

router.get('/codeforcesqp', function(req, res, next) {
  res.render('codeforcesqp');
});

router.get('/ide', function(req, res, next) {
  res.render('ide');
});

router.post('/ide', function(req, res, next) {
  var source = req.body.code;
  var input = req.body.input;
  console.log(source);
  console.log(input);
  var out = "";

  //var hello = exec('echo \"' + source.toString() + '\" > dummy.cpp');
  fs.writeFileSync('dummy.cpp', source);
  fs.writeFileSync('input.txt', input);
  var cat = exec('cat dummy.cpp');
  cat.stdout.on('data', function(data) {
    console.log(String(data));
  });


  var gpp = spawn('g++', ['dummy.cpp']);

  gpp.stdout.on('data', function(data) {
    res.send(String(data));
  });

  gpp.stderr.on('data', function(data) {
    console.log(String(data));
  });

  gpp.on('close', function(data) {
    if (data === 0) {
      var run = exec('./a.out < input.txt');
      run.stdout.on('data', function(out) {
        res.send(String(out));
      });

      run.stderr.on('data', function(out) {
        console.log(String(out));
      });

      run.on('close', function(out) {
        console.log(String(out));
      });
    }
  });

  var rm = exec('rm dummy.cpp');

});

module.exports = router;
