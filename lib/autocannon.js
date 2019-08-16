'use strict';

const autocannon = require('autocannon');
const PARSE_CONFIG = require('../config');

const run = (opts = {}, requests = []) => new Promise((resolve, reject) => {
  opts.url = opts.serverURL || PARSE_CONFIG.SERVER_URL;
  opts.headers = {
    'cache-control': false,
    'content-type': 'application/json',
    'x-parse-application-id': 'an-example-app-id',
    'x-parse-rest-api-key': undefined,
  };
  opts.requests = requests;

  const instance = autocannon(opts, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });

  if (process.env.DEBUG) {
    autocannon.track(instance);
  }

  // this is used to kill the instance on CTRL-C
  process.once('SIGINT', () => {
    instance.stop();
  });
});

module.exports.fire = async (opts, handler, requests, save) => {
  const result = await run(opts, requests);
  return save ? result : null;
};
