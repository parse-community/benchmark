#!/usr/bin/env node
'use strict';

const program = require('commander');
const inquirer = require('inquirer');
const bench = require('./lib/bench');
const path = require('path');
const fs = require('fs');

const benchmarkPath = path.join(__dirname, 'benchmarks');
const benchmarks = fs.readdirSync(benchmarkPath).filter(file => file.includes('.js'));

program
  .option('-c, --connections [NUM]', 'The number of concurrent connections to use. default: 10.')
  .option('-p, --pipelining  [NUM]', 'The number of pipelined requests to use. default: 1.')
  .option('-d, --duration    [SEC]', 'The number of seconds to run the autocannnon. default: 10.');

program.parse(process.argv);

if (!program.connections && !program.pipelining && !program.duration) {
  showPrompt();
} else {
  const opts = {
    connections: program.connections || 10,
    pipelining: program.pipelining || 1,
    duration: program.duration || 10,
  };
  bench(opts, benchmarks);
}

function select(callback) {
  inquirer.prompt([{
    type: 'checkbox',
    message: 'Select servers',
    name: 'list',
    choices: benchmarks,
    validate: (answer) => {
      if (answer.length < 1) {
        return 'You must choose at least one server.';
      }
      return true;
    }
  }]).then(function (answers) {
    callback(answers.list);
  });
}

function showPrompt() {
  inquirer.prompt([{
    type: 'confirm',
    name: 'all',
    message: 'Do you want to run all benchmark tests?',
    default: false
  }, {
    type: 'input',
    name: 'connections',
    message: 'How many connections do you need?',
    default: 10,
    validate (value) {
      return !Number.isNaN(parseFloat(value)) || 'Please enter a number';
    },
    filter: Number
  }, {
    type: 'input',
    name: 'pipelining',
    message: 'How many pipelines do you need?',
    default: 1,
    validate (value) {
      return !Number.isNaN(parseFloat(value)) || 'Please enter a number';
    },
    filter: Number
  }, {
    type: 'input',
    name: 'duration',
    message: 'How long should it take?',
    default: 10,
    validate (value) {
      return !Number.isNaN(parseFloat(value)) || 'Please enter a number';
    },
    filter: Number
  }]).then((opts) => {
    if (!opts.all) {
      select(list => bench(opts, list));
    } else {
      bench(opts, benchmarks);
    }
  });
}
