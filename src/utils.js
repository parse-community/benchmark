#!/usr/bin/env node
'use strict';

const fs = require('fs');
const Table = require('cli-table');
const PARSE_CONFIG = require('./config');

function cliTable(data) {
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
  console.log('');
  console.log(table.toString());
  return rows;
}

function saveToFile(file = 'result.json', data) {
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
  fs.writeFileSync(file, JSON.stringify(result));
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

module.exports = {
  buildOptions,
  bytesToSize,
  cliTable,
  processData,
  saveToFile,
};
