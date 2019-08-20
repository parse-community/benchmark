'use strict';

const instance = {
  stop: () => {},
};
let _result;
const setResult = (result) => {
  _result = result;
};
let _error;
const setError = (error) => {
  _error = error;
};
const autocannon = (opts, callback) => {
  callback(_error, _result);
  return instance;
};
autocannon.setResult = setResult;
autocannon.setError = setError;
autocannon.instance = instance;
autocannon.track = () => {};

module.exports = autocannon;
