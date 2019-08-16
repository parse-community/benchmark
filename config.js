const PORT =  process.env.PORT || 1337;

module.exports = exports = {
  APP_NAME: 'Parse Server Benchmark',
  APP_ID: 'an-example-app-id',
  MASTER_KEY: 'a-super-secret-master-key',
  PORT: PORT,
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${PORT}`,
  POSTGRES_URI: process.env.POSTGRES_URI || 'postgres://localhost:5432/parse_benchmark',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/parse_benchmark',
  VERBOSE: process.env.VERBOSE || false,
};
