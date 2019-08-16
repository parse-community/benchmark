#!/usr/bin/env node
'use strict';

const { fork } = require('child_process');
const { TestUtils } = require('parse-server');
const Table = require('cli-table');
const fs = require('fs');
const ora = require('ora');
const path = require('path');
const { fire } = require('./autocannon');

const testPath = path.join(__dirname, '..', 'tests'); 
const TESTS = fs.readdirSync(testPath).filter(file => file.includes('.js'));

const doBench = async (opts, handler) => {
  const spinner = ora(`Started ${handler}`).start();
  const forked = fork(path.join(__dirname, '..', 'benchmarks', handler));
  for (let i = 0; i < TESTS.length; i += 1) {
    const test = require(path.join(testPath, TESTS[i]));
    const testName = `${handler} - ${TESTS[i]}`;
    try {
      spinner.color = 'magenta';
      spinner.text = `Warming ${testName}`;
      // await TestUtils.destroyAllDataPermanently();
      await fire(opts, handler, test.requests, false);
    } catch (error) {
      return console.log(error);
    } finally {
      spinner.color = 'yellow';
      spinner.text = `Working ${testName}`;
    }
    
    try {
      const result = await fire(opts, handler, test.requests, true);
      // TODO: Add more benchmarks here
      forked.kill('SIGINT');
      spinner.text = `Results saved for ${testName}`;
      spinner.succeed();
      result.testName = testName;
      return result;
    } catch (error) {
      return console.log(error);
    }
  }
};

const table = new Table({
  head: ['', 'Requests/s', 'Latency', 'Throughput/Mb'],
});

const start = async (opts, list, index = 0) => {
  if (list.length === index) {
    console.log(table.toString());
    return true;
  }
  try {
    const data = await doBench(opts, list[index]);
    if (data) {
      table.push([
        data.testName,
        (data.requests.average).toFixed(1),
        (data.latency.average).toFixed(2),
        (data.throughput.average / 1024 / 1024).toFixed(2),
      ]);
    }
    index += 1;
    return start(opts, list, index);
  } catch (error) {
    return console.log(error);
  }
};

module.exports = start;
