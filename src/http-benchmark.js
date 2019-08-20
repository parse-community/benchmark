'use strict';
const autocannon = require('autocannon');

module.exports.run = (opts = {}, track = false) => new Promise((resolve, reject) => {
  const instance = autocannon(opts, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
  if (process.env.DEBUG || track) {
    autocannon.track(instance);
  }
  // This is used to kill the instance on CTRL-C
  process.once('SIGINT', () => {
    /* istanbul ignore next */
    instance.stop();
  });
});
