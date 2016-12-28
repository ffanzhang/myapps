var express = require('express');
var router = express.Router();
var Codeforces = require('../models/Codeforces');
var Promise = require('bluebird');

router.get('/', function(req, res, next) {
  res.render('codeforces');
});

function solvedCount(s1, s2) {
  return s2.solvedCount - s1.solvedCount;
}

router.get('/problems/recommended/:handle', function(req, res, next) {
  Promise.all([Codeforces.getSubmissions(req.params.handle), Codeforces.getProblems()])
    .then(function([submissions, problems]) {
      var o = {}
      for (var i = 0; i < submissions.length; i++) {
        if (submissions[i].verdict == 'OK') { 
          var contestId = submissions[i].problem.contestId;
          var index = submissions[i].problem.index;
          o[contestId + index] = 1;
        }
      }
      function notSolved(problem) {
        return !(problem.contestId + problem.index in o);
      };
      /*
      var ps = problems.problems;
      var ps = ps.filter(notSolved);
      */
      var stats = problems.problemStatistics;
      var stats = stats.filter(notSolved);
      stats.sort(solvedCount);
      res.send(stats);
    })
    .catch(function(e) {
      console.log(e);
    });
});

router.get('/problems', function(req, res, next) {
  Codeforces.getProblems()
    .then(function(r) {
      res.send(r);
    })
    .catch(function(e) {
      res.send(e);
    });
});

router.get('/submissions/:handle', function(req, res, next) {
  Codeforces.getSubmissions(req.params.handle)
    .then(function(r) {
      res.send(r);
    })
    .catch(function(e) {
      res.send(e);
    });
});

module.exports = router;

