const express = require('express');
const router = express.Router();
const UVA = require('../models/UVA');
const Promise = require('bluebird');

router.get('/', function(req, res, next) {
  res.render('uva');
});

router.get('/uids/:username', function(req, res, next) {
  let uid = UVA.uname2uid(req.params.username);
  uid.then(function(r) {
    if (r.statusCode == 200) {
      res.send(r.body);
    }
  })
  .catch(function(e) {
    res.send(e);
  });
});

router.get('/problems', function(req, res, next) {
  UVA.getProblems()
    .then(function(r) {
      if (r.statusCode == 200) {
        let problems = JSON.parse(r.body);
        problems.sort(UVA.compareBySolves);
        res.send(problems);
      }
    })
    .catch(function(e) {
      res.send(e);
    });
});

router.get('/problems/recommended/:username', function(req, res, next) {
    Promise.all([UVA.getSubmissionsByUsername(req.params.username), UVA.getProblems()])
    .then(function(r) {

      // let submissions = JSON.parse(submissions.body).subs;
      //let problems = JSON.parse(problems.body);
      let submissions = JSON.parse(r[0].body).subs;
      let problems = JSON.parse(r[1].body);
      const PID = 1;
      const VID = 2;
      const AC = '90';
      let o = {};
      for (let i = 0; i < submissions.length; i++) {
        if (submissions[i][VID] == AC) {
          o[submissions[i][PID]] = 1; 
        }
      }
      function notSolved(problem) {
        return !(problem[0] in o);
      }
      problems = problems.filter(notSolved);
      problems.sort(UVA.compareBySolves);
      res.send({problems: problems, submissions: submissions});
    })
    .catch(function(e) {
      res.send(e);
    });
});

router.get('/problems/id/:id', function(req, res, next) {
  UVA.getProblemById(req.params.id)
    .then(function(r) {
      if (r.statusCode == 200) {
        res.send(r.body);
      }
    })
    .catch(function(e) {
      res.send(e);
    });
});

router.get('/problems/num/:num', function(req, res, next) {
  UVA.getProblemByNum(req.params.num)
    .then(function(r) {
      if (r.statusCode == 200) {
        res.send(r.body);
      }
    })
    .catch(function(e) {
      res.send(e);
    });
});

router.get('/submissions/:uid', function(req, res, next) {
  UVA.getSubmissions(req.params.uid)
    .then(function(r) {
      if (r.statusCode == 200) {
        res.send(r.body);
      }
    })
    .catch(function(e) {
      res.send(e);
    });
});

module.exports = router;
