var Promise = require("bluebird");
var request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
const END_POINT = 'http://www.codeforces.com/api/';

class Codeforces {
  static getSubmissions(handle) {
    var url = END_POINT + 'user.status?handle=' + handle;
    return request(url)
      .then(function(r) {
        return JSON.parse(r.body).result;
      });
  }
  static getProblems() {
    var url = END_POINT + 'problemset.problems';
    return request(url)
      .then(function(r) {
        return JSON.parse(r.body).result;
      });
  }
}

module.exports = Codeforces;
