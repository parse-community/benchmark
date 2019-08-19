#!/usr/bin/env node
'use strict';

const { TestUtils } = require('parse-server');
const Table = require('cli-table');
const fs = require('fs');
const ora = require('ora');
const path = require('path');
const { fork } = require('child_process');
const { run } = require('./autocannon');
const monitor = require('./monitor.js');

const doBench = (opts, serverName, benchmarks) => {
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
            testName = `${serverName} | ${benchmarks[i]}`;
            const requests = await benchmark.getRequests();

            spinner.color = 'yellow';
            spinner.text = `Working ${testName}`;

            if (process.env.CLEAR) {
              await TestUtils.destroyAllDataPermanently();
            }
            const m = new monitor();
            const result = await run(opts, requests);
            const meter = m.stop(testName);

            spinner.text = `Results saved for ${testName}`;
            spinner.succeed();
            results.push({ [testName] : Object.assign({}, result, meter) });
          } catch (error) {
            spinner.text = `Failed saved for ${testName}`;
            spinner.fail();
            console.log(error);
          }
        }
        serverProcess.kill('SIGINT');
      }
    });
    serverProcess.on('close', () => {
      resolve(results);
    });
  });
};

const cliTable = (data) => {
  const table = new Table({
    head: ['', 'Requests/s', 'Latency', 'Throughput/Mb', 'Ram', 'Heap Total', 'Heap Used', 'Cpu %'],
  });
  const rows = data.map((result) => {
    const key = Object.keys(result)[0];
    return [
      key,
      (result[key].requests.average).toFixed(1),
      (result[key].latency.average).toFixed(2),
      (result[key].throughput.average / 1024 / 1024).toFixed(2),
      bytesToSize(result[key].ram),
      bytesToSize(result[key].heapTotal),
      bytesToSize(result[key].heapUsed),
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
    ram: processData(data, 'ram'),
    cpu: processData(data, 'cpu'),
    heapTotal: processData(data, 'heapTotal'),
    heapUsed: processData(data, 'throughput'),
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
  if (bytes == 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
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
