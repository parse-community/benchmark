#!/usr/bin/env node
'use strict';

const { run } = require('./http-benchmark');
const { start } = require('./bench');
const program = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs');

const servers = getJSFiles('servers');
const benchmarks = getJSFiles('benchmarks');

program
  .command('test <server> [test]')
  .option('-c, --connections [NUM]', 'The number of concurrent connections to use.', 10)
  .option('-p, --pipelining  [NUM]', 'The number of pipelined requests to use.', 1)
  .option('-d, --duration    [NUM]', 'The number of seconds to run the autocannnon.', 10)
  .option('-o, --output      [FILE]', 'Output to JSON file.', 'result.json')
  .action(function (server, test, options) {
    handleAction(options, server, test);
  });

program
  .command('run')
  .option('-c, --connections [NUM]', 'The number of concurrent connections to use.', 10)
  .option('-p, --pipelining  [NUM]', 'The number of pipelined requests to use.', 1)
  .option('-d, --duration    [NUM]', 'The number of seconds to run the autocannnon.', 10)
  .option('-o, --output      [FILE]', 'Output to JSON file.', 'result.json')
  .action(function (options) {
    handleAction(options);
  });

program
  .command('options <path to json>')
  .action(async (path) => {
    console.log(path);
    const options = fs.readFileSync(path, 'utf8');
    await run(JSON.parse(options), true);
  });

program.parse(process.argv);

// No arguments
if (process.argv.length === 2) {
  showPrompt();
}

function handleAction(command, server, test) {
  const opts = {
    connections: parseInt(command.connections),
    pipelining: parseInt(command.pipelining),
    duration: parseInt(command.duration),
    output: command.output,
  };
  const apps = (server) ? [path.parse(server).name] : servers;
  const tests = (test) ? [path.parse(test).name] : benchmarks;

  start(opts, apps, tests).then(() => process.exit(0));
}

function select() {
  return inquirer.prompt([{
    type: 'checkbox',
    message: 'Select server(s)',
    name: 'apps',
    choices: servers,
    validate: (answer) => {
      if (answer.length < 1) {
        return 'You must choose at least one server.';
      }
      return true;
    }
  }]);
}

function showPrompt() {
  inquirer.prompt([{
    type: 'confirm',
    name: 'all',
    message: 'Do you want to run all benchmark tests?',
    default: true
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
  }]).then(async (opts) => {
    if (!opts.all) {
      const answers = await select();
      return start(opts, answers.apps, benchmarks);
    } else {
      return start(opts, servers, benchmarks);
    }
  }).then(() => process.exit(0));
}

// Returns JS Files in folder without extensions
function getJSFiles(folder) {
  const filePath = path.join(__dirname, '..', folder);
  return fs.readdirSync(filePath).filter(file => file.includes('.js')).map(file => path.parse(file).name);
}
