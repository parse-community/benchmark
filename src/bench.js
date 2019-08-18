#!/usr/bin/env node
'use strict';

const { TestUtils } = require('parse-server');
const Table = require('cli-table');
const fs = require('fs');
const ora = require('ora');
const path = require('path');
const { run } = require('./autocannon');

const doBench = async (opts, serverName, benchmarks) => {
  const spinner = ora(`Started ${serverName}`).start();
  const { start } = require(path.join(__dirname, '..', 'servers', serverName));
  const server = await start();

  const results = [];
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
      const result = await run(opts, requests);
      // TODO: Add more benchmarkers here

      spinner.text = `Results saved for ${testName}`;
      spinner.succeed();
      results.push({ [testName] : result });
    } catch (error) {
      spinner.text = `Failed saved for ${testName}`;
      spinner.fail();
      console.log(error);
    }
  }
  await close(server);
  return results;
};

const cliTable = (data) => {
  const table = new Table({
    head: ['', 'Requests/s', 'Latency', 'Throughput/Mb'],
  });
  const rows = data.map((result) => {
    const key = Object.keys(result)[0];
    return [
      key,
      (result[key].requests.average).toFixed(1),
      (result[key].latency.average).toFixed(2),
      (result[key].throughput.average / 1024 / 1024).toFixed(2),
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
    sha1: process.env.SHA1 || '',
    created_at: new Date(),
  };
  fs.writeFileSync('result.json', JSON.stringify(result));
}

function processData(data, field, value) {
  const output = {};
  data.forEach((result) => {
    const key = Object.keys(result)[0];
    output[key] = result[key][field][value];
  });
  return output;
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
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
