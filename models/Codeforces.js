const Promise = require("bluebird");
const request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
const END_POINT = 'http://www.codeforces.com/api/';

class Codeforces {
  static getSubmissions(handle) {
    let url = END_POINT + 'user.status?handle=' + handle;
    return request(url)
      .then(function(r) {
        return JSON.parse(r.body).result;
      });
  }
  static getProblems() {
    let url = END_POINT + 'problemset.problems';
    return request(url)
      .then(function(r) {
        return JSON.parse(r.body).result;
      });
  }
}

module.exports = Codeforces;
