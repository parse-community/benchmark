'use strict';

const { ParseServer } = require('parse-server');
const PARSE_CONFIG = require('../src/config');

const parseServer = ParseServer.start({
  databaseURI: PARSE_CONFIG.DATABASE_URL,
  appId: PARSE_CONFIG.APP_ID,
  serverURL: PARSE_CONFIG.SERVER_URL,
  publicServerURL: PARSE_CONFIG.SERVER_URL,
  masterKey: PARSE_CONFIG.MASTER_KEY,
  javascriptKey: PARSE_CONFIG.JAVASCRIPT_KEY,
  restAPIKey: PARSE_CONFIG.REST_KEY,
  collectionPrefix: PARSE_CONFIG.COLLECTION_PREFIX,
  verbose: PARSE_CONFIG.VERBOSE,
  mountPath: PARSE_CONFIG.MOUNT_PATH,
  serverStartComplete: () => process.send({ start: true }),
  serverCloseComplete: async () => await cleanUp(),
});

async function cleanUp() {
  if (process.env.CLEAR) {
    await parseServer.config.databaseController.adapter.deleteAllClasses(true);
  }
  process.exit(0);
}
