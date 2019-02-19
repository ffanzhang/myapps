const express = require('express');
const router = express.Router();
const spawn = require('child_process').spawn;

const process_options = {
  cwd : '/tmp/',
  env : {
    PATH: process.env.PATH
  }
};

class ProgramRunner {
  static run(cmd, args, input, onclose_callback) {
    let spawnObj = spawn(cmd, args, process_options);

    spawnObj.stdin.write(input);
    spawnObj.stdin.end();

    let output = "";
    spawnObj.stdout.on('data', function(out) {
      output += String(out);
    });

    spawnObj.stderr.on('data', function(out) {
      output += String(out);
    });

    spawnObj.on('error', function(err) {
      console.log(err);
    });

    spawnObj.on('close', function(data) {
      onclose_callback(output, data);
    });
  };
};

module.exports = ProgramRunner;
