var Promise = require("bluebird");
var request = Promise.promisify(require('request'));
Promise.promisifyAll(request);
const END_POINT = 'https://uhunt.felix-halim.net/api';

class UVA {
  static uname2uid(username) {
    var url = END_POINT + '/uname2uid/' + username;
    return request({url: url, headers: {
      'User-Agent': 'request'
    }});
  };
  static getProblems() {
    var url = END_POINT + '/p';
    return request(url);
  };
  static getProblemById(id) {
    var url = END_POINT + '/p/id/' + id;
    return request(url);
  };
  static getProblemByNum(num) {
    var url = END_POINT + '/p/num/' + num;
    return request(url);
  };
  static getSubmissions(uid) {
    var url = END_POINT + '/subs-user/' + uid;
    return request(url);
  };
  static getSubmissionsByUsername(username) {
    return UVA.uname2uid(username)
            .then(function(uid) {
              return UVA.getSubmissions(uid.body);
            });
  }

};

module.exports = UVA;
