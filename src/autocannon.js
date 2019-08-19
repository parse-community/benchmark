'use strict';

const autocannon = require('autocannon');
const PARSE_CONFIG = require('./config');

module.exports.run = (opts = {}, requests = []) => new Promise((resolve, reject) => {
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
