const ProgramRunner = require('./ProgramRunner');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

class ProgramRunnerService {
  static process_options() {
    return {
      cwd: '/tmp/',
      env: {
        PATH: process.env.PATH
      }
    };
  };

  static cleanup(foldername, filename, executablename) {
    execSync('rm -rf ' + foldername, ProgramRunnerService.process_options());
  };

  static make_files(source, ext) {
    let files = [];
    let foldername = path.join("tmpsrc", crypto.randomBytes(16).toString('hex'));
    let filename = path.join(foldername, crypto.randomBytes(32).toString('hex') + ext);
    let executablename = path.join(foldername, crypto.randomBytes(32).toString('hex'));

    if (!fs.existsSync(path.join('/tmp', 'tmpsrc'))) {
      execSync('mkdir tmpsrc', ProgramRunnerService.process_options());
    }

    execSync('mkdir ' + foldername, ProgramRunnerService.process_options());
    execSync('touch ' + filename, ProgramRunnerService.process_options());

    fs.writeFileSync(path.join('/tmp', filename), source);

    files.push(foldername);
    files.push(filename);
    files.push(executablename);
    return files;
  };

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
      case "gcc": {
        let files = ProgramRunnerService.make_files(source, '.c');
        let foldername = files[0];
        let filename = files[1];
        let executablename = files[2];
        ProgramRunner.run('gcc', [filename, '-o', executablename], input, function(out, data) {
          if (data == 0) {
            ProgramRunner.run('./' + executablename, [], input, function(out, data) {
              ProgramRunnerService.cleanup(foldername, filename, executablename);
              res.send(out);
            });
          } else {
            ProgramRunnerService.cleanup(foldername, filename, executablename);
            res.send(out);
          }
        });
        break;
      }
      case "g++": {
        let files = ProgramRunnerService.make_files(source, '.cc');
        let foldername = files[0];
        let filename = files[1];
        let executablename = files[2];
        ProgramRunner.run('g++', [filename, '--std=c++11', '-o', executablename], input, function(out, data) {
          if (data == 0) {
            ProgramRunner.run('./' + executablename, [], input, function(out, data) {
              ProgramRunnerService.cleanup(foldername, filename, executablename);
              res.send(out);
            });
          } else {
            ProgramRunnerService.cleanup(foldername, filename, executablename);
            res.send(out);
          }
        });
        break;
      }
      default:
        ProgramRunner.run('python', ['-c', source], input, function(out) {
          res.send(out);
        });
        break;
    };
  }
};

module.exports = ProgramRunnerService;
