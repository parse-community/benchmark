#!/usr/bin/env node
'use strict';

const ora = require('ora');
const path = require('path');
const pidusage = require('pidusage');
const { saveToFile, cliTable, buildOptions } = require('./utils');
const { fork } = require('child_process');
const { run } = require('./http-benchmark');

const runTest = (opts, serverName, benchmarks) => {
  const spinner = ora(`Started ${serverName}`).start();
  const serverProcess = fork(path.join(__dirname, '..', 'servers', serverName));

  return new Promise((resolve) => {
    const results = [];

    serverProcess.on('message', async (m) => {
      if (m.start) {
        for (let i = 0; i < benchmarks.length; i += 1) {
          let testName;
          try {
            const benchmark = require(path.join(__dirname, '..', 'benchmarks', benchmarks[i]));
            testName = `${serverName} ${benchmarks[i]}`;
            const requests = await benchmark.getRequests();

            spinner.color = 'yellow';
            spinner.text = `Working ${testName}`;

            const result = await run(buildOptions(opts, requests));
            const usage = await pidusage(serverProcess.pid);

            results.push({ [testName] : Object.assign({}, result, usage) });

            spinner.text = `Results saved for ${testName}`;
            spinner.succeed();
          } catch (error) {
            spinner.text = `Failed saved for ${testName}`;
            spinner.fail();
            console.error(error);
          }
        }
        serverProcess.kill('SIGINT');
      } else {
        /* istanbul ignore next */
        console.error("Could not start server process. Call process.send('message', { start: true })");
      }
    });
    serverProcess.on('close', () => {
      resolve(results);
    });
  });
};

const start = async (opts, servers, benchmarks, data = [], index = 0) => {
  try {
    if (servers.length === index) {
      cliTable(data);
      saveToFile(opts.output, data);
      return;
    }
    const results = await runTest(opts, servers[index], benchmarks);
    data.push(...results);
    index += 1;
    return start(opts, servers, benchmarks, data, index);
  } catch (error) {
    return console.error(error);
  }
};

module.exports = { start, runTest };
