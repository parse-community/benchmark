#!/usr/bin/env node
'use strict';

const { fork } = require('child_process');
const Table = require('cli-table');
const ora = require('ora');
const path = require('path');
const { fire } = require('./autocannon');

const doBench = async (opts, handler) => {
  const spinner = ora(`Started ${handler}`).start();

  const forked = fork(path.join(__dirname, '..', 'benchmarks', handler));
  try {
    spinner.color = 'magenta';
    spinner.text = `Warming ${handler}`;
    await fire(opts, handler, false);
  } catch (error) {
    return console.log(error);
  } finally {
    spinner.color = 'yellow';
    spinner.text = `Working ${handler}`;
  }

  try {
    const result = await fire(opts, handler, true);
    // TODO: Add more benchmarks here
    forked.kill('SIGINT');
    spinner.text = `Results saved for ${handler}`;
    spinner.succeed();
    return result;
  } catch (error) {
    return console.log(error);
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
        list[index],
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
