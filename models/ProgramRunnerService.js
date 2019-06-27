const ProgramRunner = require('./ProgramRunner');

class ProgramRunnerService {
  static dispatch(req, res) {
    let source = req.body.code;
    let input = req.body.input;
    let compiler = req.body.compiler;
    switch (compiler) {
      case "python3":
        ProgramRunner.run('python3', ['-c', source], input, function(out, data) {
          res.send(out);
        });
        break;
      case "python":
        ProgramRunner.run('python', ['-c', source], input, function(out, data) {
          res.send(out);
        });
        break;
      case "gcc":
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

        break;
      case "g++":
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
        break;
      default:
        ProgramRunner.run('python', ['-c', source], input, function(out) {
          res.send(out);
        });
        break;
    };
  }
};

module.exports = ProgramRunnerService;
