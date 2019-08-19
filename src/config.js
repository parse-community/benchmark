const PORT =  process.env.PARSE_PORT || 1337;

module.exports = exports = {
  APP_NAME: process.env.PARSE_APP_NAME || 'Parse Server Benchmark',
  APP_ID: process.env.PARSE_APP_ID || 'app-id',
  JAVASCRIPT_KEY: process.env.PARSE_JAVASCRIPT_KEY || 'javascript-key',
  MASTER_KEY: process.env.PARSE_MASTER_KEY || 'master-key',
  REST_KEY: process.env.PARSE_REST_KEY || 'rest-key',
  MOUNT_PATH: process.env.PARSE_MOUNT_PATH || '/',
  PORT: PORT,
  SERVER_URL: process.env.PARSE_SERVER_URL || `http://localhost:${PORT}`,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://localhost:5432/parse_benchmark',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/parse_benchmark',
  VERBOSE: process.env.VERBOSE || false,
};
