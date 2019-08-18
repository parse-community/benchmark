'use strict';

const Parse = require('parse/node');
const PARSE_CONFIG = require('./config');

Parse.initialize(PARSE_CONFIG.APP_ID, PARSE_CONFIG.JAVASCRIPT_KEY, PARSE_CONFIG.MASTER_KEY);
Parse.serverURL = PARSE_CONFIG.SERVER_URL;

module.exports = Parse;
