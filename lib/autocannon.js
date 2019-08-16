'use strict';

const autocannon = require('autocannon');
const PARSE_CONFIG = require('../config');

const run = (opts = {}) => new Promise((resolve, reject) => {
  opts.url = opts.url || PARSE_CONFIG.SERVER_URL;
  const instance = autocannon(opts, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
  // this is used to kill the instance on CTRL-C
  process.once('SIGINT', () => {
    instance.stop();
  });
});

module.exports.fire = async (opts, handler, save) => {
  const result = await run(opts);
  return save ? result : null;
};
