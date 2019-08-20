#!/usr/bin/env node
'use strict';

const fs = require('fs');
const ora = require('ora');
const path = require('path');
const Table = require('cli-table');
const pidusage = require('pidusage');
const { TestUtils } = require('parse-server');
const { fork } = require('child_process');
const { run } = require('./autocannon');
const PARSE_CONFIG = require('./config');

const doBench = (opts, serverName, benchmarks) => {
  const spinner = ora(`Started ${serverName}`).start();
  const serverProcess = fork(path.join(__dirname, '..', 'servers', serverName), [], { stdio: 'pipe' });
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

            if (process.env.CLEAR) {
              await TestUtils.destroyAllDataPermanently();
            }
            const result = await run(buildOptions(opts, requests));
            const usage = await pidusage(serverProcess.pid);

            results.push({ [testName] : Object.assign({}, result, usage) });

            spinner.text = `Results saved for ${testName}`;
            spinner.succeed();
          } catch (error) {
            spinner.text = `Failed saved for ${testName}`;
            spinner.fail();
            console.log(error);
          }
        }
        serverProcess.kill('SIGINT');
      }
    });
    serverProcess.on('close', async () => {
      resolve(results);
    });
  });
};

const cliTable = (data) => {
  const table = new Table({
    head: ['', 'Requests/s', 'Latency', 'Throughput/Mb', 'Ram', 'Cpu %'],
  });
  const rows = data.map((result) => {
    const key = Object.keys(result)[0];
    return [
      key,
      (result[key].requests.average).toFixed(1),
      (result[key].latency.average).toFixed(2),
      (result[key].throughput.average / 1024 / 1024).toFixed(2),
      bytesToSize(result[key].memory),
      result[key].cpu,
    ];
  });
  table.push(...rows);
  console.log(table.toString());
};

function saveToFile(data) {
  const result = {
    req_per_second: processData(data, 'requests', 'average'),
    max_latency: processData(data, 'latency', 'max'),
    avg_latency: processData(data, 'latency', 'average'),
    max_throughput: processData(data, 'throughput', 'max'),
    avg_throughput: processData(data, 'throughput', 'average'),
    ram: processData(data, 'memory'),
    cpu: processData(data, 'cpu'),
    sha1: process.env.SHA1 || '',
    created_at: new Date(),
  };
  fs.writeFileSync('result.json', JSON.stringify(result));
}

function processData(data, field, value) {
  const output = {};
  data.forEach((result) => {
    const key = Object.keys(result)[0];
    if (value) {
      output[key] = result[key][field][value];
    } else {
      output[key] = result[key][field];
    }
  });
  return output;
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function buildOptions(opts, requests) {
  opts.url = opts.serverURL || PARSE_CONFIG.SERVER_URL;
  opts.headers = {
    'cache-control': false,
    'content-type': 'application/json',
    'X-Parse-Application-Id': PARSE_CONFIG.APP_ID,
    'X-Parse-Master-Key': PARSE_CONFIG.MASTER_KEY,
    'X-Parse-REST-API-Key': PARSE_CONFIG.REST_KEY,
    'X-Parse-Javascript-Key': PARSE_CONFIG.JAVASCRIPT_KEY,
  };
  opts.requests = requests;
  return opts;
}

const data = [];
const start = async (opts, servers, benchmarks, index = 0) => {
  if (servers.length === index) {
    cliTable(data);
    saveToFile(data);
    return;
  }
  try {
    const results = await doBench(opts, servers[index], benchmarks);
    data.push(...results);
    index += 1;
    return start(opts, servers, benchmarks, index);
  } catch (error) {
    return console.log(error);
  }
};

module.exports = start;
