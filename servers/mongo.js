'use strict';

const { ParseServer } = require('parse-server');
const PARSE_CONFIG = require('../src/config');
const express = require('express');

module.exports = {
  start: () => new Promise((resolve, reject) => {
    const app = express();
    const parseServer = new ParseServer({
      databaseURI: PARSE_CONFIG.MONGODB_URI,
      appId: PARSE_CONFIG.APP_ID,
      serverURL: PARSE_CONFIG.SERVER_URL,
      publicServerURL: PARSE_CONFIG.SERVER_URL,
      masterKey: PARSE_CONFIG.MASTER_KEY,
      javascriptKey: PARSE_CONFIG.JAVASCRIPT_KEY,
      restAPIKey: PARSE_CONFIG.REST_KEY,
      verbose: PARSE_CONFIG.VERBOSE,
    });
    app.use('/', parseServer);

    const server = app.listen(PARSE_CONFIG.PORT, (error) => {
      return (error) ? reject(error) : resolve(server);
    });
  }),
};
