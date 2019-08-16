'use strict';

const { ParseServer } = require('parse-server');
const PARSE_CONFIG = require('../config');

const express = require('express');
const app = express();

const parseServer = new ParseServer({
  databaseURI: PARSE_CONFIG.POSTGRES_URI,
  appId: PARSE_CONFIG.APP_ID,
  serverURL: PARSE_CONFIG.SERVER_URL,
  masterKey: PARSE_CONFIG.MASTER_KEY,
  javascriptKey: PARSE_CONFIG.JAVASCRIPT_KEY,
  verbose: PARSE_CONFIG.VERBOSE,
});

app.use('/', parseServer);

app.listen(PARSE_CONFIG.PORT);
