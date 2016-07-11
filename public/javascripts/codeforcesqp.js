$(function() {

  var cache = new Object();
  var completedQuestions = {};
  var recommendedProblems = [];

  var recordCompletedQuestions = function(data) {
    for (var i = 0; i < data.result.length; i++) {
      if (data.result[i].verdict == 'OK') {
        var primaryKey = data.result[i].contestId + data.result[i].problem.index;
        completedQuestions[primaryKey] = true;
      }
    }
    preprocessReady = true;
  };

  var displaySubmissions = function(data, numDisplay) {
    var rowopen = '<tr>';
    var rowclose = '</tr>';
    $('table#mySubmissions > thead').empty(); 
    $('table#mySubmissions > tbody').empty(); 

    $('table#mySubmissions > thead').append(rowopen +
        '<td>Id</td>' +
        '<td>Problem</td>' +
        '<td>Name</td>' +
        '<td>Status</td>' +
        rowclose);

    for (var i = 0; i < numDisplay; i++) {
      var id = data.result[i].id;
      var contestId = data.result[i].contestId;
      var index = data.result[i].problem.index;
      var name = data.result[i].problem.name
        if (contestId < 100000) {
          var idCell = "<td><a href='http://www.codeforces.com/contest/" + contestId 
            + "/submission/" + id + "' target='_blank'>" + id + "</a></td>";
          var problemCell = "<td><a href='http://www.codeforces.com/problemset/problem/" + contestId
            + "/" + index + "' target='_blank'>" + name + "</a></td>";

        } else {
          var idCell = "<td><a href='http://www.codeforces.com/gym/" + contestId +
            "/submission/" + id + "' target='_blank'>" + id + "</a></td>";
          var problemCell = "<td><a href='http://www.codeforces.com/gym/" + contestId + "' target='_blank'>" + name + "</a></td>";
        }
      var key = '<td>' + contestId + index + '</td>';
      var verdict = '<td>' + data.result[i].verdict + '</td>';
      $('table#mySubmissions > tbody').append(rowopen 
          + idCell 
          + key
          + problemCell
          + verdict
          + rowclose);
    }
  };

  var displayProblems = function(data, numDisplay) {
    var rowopen = '<tr>';
    var rowclose = '</tr>';
    $('table#myProblems > thead').empty();
    $('table#myProblems > tbody').empty();

    $('table#myProblems > thead').append(rowopen +
        '<td>Problem</td>' +
        '<td>Name</td>' +
        rowclose);

    for (var i = 0; i < numDisplay; i++) {
      var contestId = data[i].contestId;
      var index = data[i].index;
      var name = data[i].name;
      var key = '<td>' + contestId + index + '</td>'
        if (contestId < 100000) {
          var problemCell = "<td><a href='http://www.codeforces.com/problemset/problem/" + contestId
            + "/" + index + "' target='_blank'>" + name + "</a></td>";
        } else {
          var problemCell = "<td><a href='http://www.codeforces.com/gym/" + contestId + "' target='_blank'>" + name + "</a></td>";
        }

      var name = '<td>' + data[i].name + '</td>'
        $('table#myProblems > tbody').append(rowopen 
            + key
            + problemCell
            + rowclose);
    }
  };

  var getRecommended = function(problemSet) {
    recommendedProblems = [];
    for (var i = 0; i < problemSet.result.problems.length; i++) {
      var lookupKey = problemSet.result.problems[i].contestId +
        problemSet.result.problems[i].index;
      if (!completedQuestions[lookupKey]) {
        var recommendedProblem = new Object();
        recommendedProblem.contestId = problemSet.result.problems[i].contestId;
        recommendedProblem.index = problemSet.result.problems[i].index;
        recommendedProblem.name = problemSet.result.problems[i].name;
        recommendedProblem.solvedCount = problemSet.result.problemStatistics[i].solvedCount;
        recommendedProblems.push(recommendedProblem);
      }
    }
  };

  var sortRecommended = function() {
    recommendedProblems.sort(function(a, b) {
      return b.solvedCount - a.solvedCount;
    });
  };

  var sizeLookup = [50, 10];
  var symbolLookup = ['glyphicon-chevron-down',
  'glyphicon-chevron-up'];
  var pexpanded = 0;
  $('button#moreP').click(function() {
    displayProblems(recommendedProblems, sizeLookup[pexpanded]);
    $('button#moreP > span').removeClass(symbolLookup[pexpanded]);
    pexpanded ^=1;
    $('button#moreP > span').addClass(symbolLookup[pexpanded]);
  });

  var sexpanded = 0;
  $('button#moreS').click(function() {
    displaySubmissions(cache.mySubmissions, sizeLookup[sexpanded]);
    $('button#moreS > span').removeClass(symbolLookup[sexpanded]);
    sexpanded ^= 1;
    $('button#moreS > span').addClass(symbolLookup[sexpanded]);
  });

  $('button#submitHandle').click(function() {
    $('#submitHandle').attr('disabled', true);
    completedQuestions = {};
    var handle = $('#handle').val();
    var ANIMATION_TIME = 300;

    var pHideRTable = new Promise(function(resolve, reject) {
      $('#rtableSection').hide(ANIMATION_TIME, resolve(0));
    });

    var pHideSTable = new Promise(function(resolve, reject) {
      $('#stableSection').hide(ANIMATION_TIME, resolve(0));
    });

    var pSubmissions = new Promise(function(resolve, reject) {
      $.get("http://www.codeforces.com/api/user.status?handle=" + handle, function(data, status) {
        recordCompletedQuestions(data);
        resolve(data);
        displaySubmissions(data, 10);
        $('#stableSection').show(ANIMATION_TIME);
        cache.mySubmissions = data;//jQuery.extend(true, {}, data);
      });
    });

    var pProblems = new Promise(function(resolve, reject) {
      $.get("http://www.codeforces.com/api/problemset.problems", function(data, status) {
        resolve(data);
      });
    });

    Promise.all([pProblems, pSubmissions, pHideRTable, pHideSTable]).then(function(values) {
      getRecommended(values[0]);
      sortRecommended();
      displayProblems(recommendedProblems, 10);
      $('#rtableSection').show(ANIMATION_TIME);
      cache.myProblems = values[0];//jQuery.extend(true, {}, values[0]);
      $('#submitHandle').attr('disabled', false);
    });

  });
});
