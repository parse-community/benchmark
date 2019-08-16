#!/usr/bin/env node
'use strict';

const program = require('commander');
const inquirer = require('inquirer');
const bench = require('./lib/bench');
const PARSE_CONFIG = require('./config');

const BENCHMARKS = ['pg', 'mongo'];

program
  .option('-c, --connections [NUM]', 'The number of concurrent connections to use. default: 10.')
  .option('-p, --pipelining  [NUM]', 'The number of pipelined requests to use. default: 1.')
  .option('-d, --duration    [SEC]', 'The number of seconds to run the autocannnon. default: 10.')
  .option('-u, --url         [STR]', `Server URL for Parse Server. default: ${PARSE_CONFIG.SERVER_URL}.`);

program.parse(process.argv);

if (!program.connections && !program.pipelining && !program.duration && !program.url) {
  showPrompt();
} else {
  const opts = {
    connections: program.connections || 10,
    pipelining: program.pipelining || 1,
    duration: program.duration || 10,
    url: program.url || PARSE_CONFIG.SERVER_URL,
  };
  bench(opts, BENCHMARKS);
}

const select = callback => {
  inquirer.prompt([{
    type: 'checkbox',
    message: 'Select servers',
    name: 'list',
    choices: BENCHMARKS,
    validate: (answer) => {
      if (answer.length < 1) {
        return 'You must choose at least one server.';
      }
      return true;
    }
  }]).then(function (answers) {
    callback(answers.list);
  });
};

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
  }, {
    type: 'input',
    name: 'url',
    message: 'What is Server URL?',
    default: PARSE_CONFIG.SERVER_URL,
  }]).then((opts) => {
    if (!opts.all) {
      select(list => bench(opts, list));
    } else {
      bench(opts, BENCHMARKS);
    }
  });
}
