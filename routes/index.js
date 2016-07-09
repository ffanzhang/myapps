var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fan\'s Apps' });
});

router.get('/codeforcesqp', function(req, res, next) {
  res.render('codeforcesqp');
});

router.post('/codeforcesqp', function(req, res, next) {
  var url = 'http://www.codeforces.com/api/user.status?handle=' + req.body.handle;
  var problemsetUrl = 'http://www.codeforces.com/api/problemset.problems';

  var memComplete = {};
  request(url, function(serror, sresponse, sbod) {
    if (!serror && sresponse.statusCode == 200) {
      var sresult = JSON.parse(sbod);
      request(problemsetUrl, function(perror, presponse, pbod) {
        if (!perror && presponse.statusCode == 200) {
          var presult = JSON.parse(pbod);
          var completedproblems = [];
          var recommendedproblems = []
          for (var i = 0; i < sresult.result.length; i++) {
            if (sresult.result[i].verdict == 'OK') {
              var pkey = sresult.result[i].contestId + sresult.result[i].problem.index;
              memComplete[pkey] = true;
            }
          }
          for (var i = 0; i < presult.result.problems.length; i++) {
            var s = presult.result.problems[i].contestId +
              presult.result.problems[i].index;
            if (!memComplete[s]) {
              var rp = new Object();
              rp.contestId = presult.result.problems[i].contestId;
              rp.index = presult.result.problems[i].index;
              rp.name = presult.result.problems[i].name;
              rp.solvedCount = presult.result.problemStatistics[i].solvedCount;
              recommendedproblems.push(rp);
            }
          }

          recommendedproblems.sort(function(a, b) {
            return b.solvedCount - a.solvedCount;
          });

          res.render('codeforcesqpresults', { sdata : sresult, pdata: presult, rp: recommendedproblems});
        }
      });

    }
  });
});

module.exports = router;
