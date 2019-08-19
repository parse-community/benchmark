'use strict';

const { ParseServer } = require('parse-server');
const PARSE_CONFIG = require('../src/config');

ParseServer.start({
  databaseURI: PARSE_CONFIG.MONGODB_URI,
  appId: PARSE_CONFIG.APP_ID,
  serverURL: PARSE_CONFIG.SERVER_URL,
  publicServerURL: PARSE_CONFIG.SERVER_URL,
  masterKey: PARSE_CONFIG.MASTER_KEY,
  javascriptKey: PARSE_CONFIG.JAVASCRIPT_KEY,
  restAPIKey: PARSE_CONFIG.REST_KEY,
  verbose: PARSE_CONFIG.VERBOSE,
  mountPath: PARSE_CONFIG.MOUNT_PATH,
  serverStartComplete: () => process.send({ start: true }),
  serverCloseComplete: () => process.exit(0),
});
