# Parse Server Benchmark (with MongoDB and PostgreSQL)

This is an example that sets up **parse-server**, one instance each
using `MongoStorageAdapter` and `PostgresStorageAdapter`

## Setup Mongodb
```
$ npm install -g mongodb-runner
$ mongodb-runner start
```
***Note:*** *If installation with* `-g` *fails due to permission problems* (`npm ERR! code 'EACCES'`), *please refer to [this link](https://docs.npmjs.com/getting-started/fixing-npm-permissions).*


## Setup Postgres
```
$ psql -c 'create database parse_benchmark;' -U postgres
$ psql -c 'CREATE EXTENSION postgis;' -U postgres -d parse_benchmark
$ psql -c 'CREATE EXTENSION postgis_topology;' -U postgres -d parse_benchmark
```

## Running Benchmark

### Locally
```
$ git clone https://github.com/parse-community/benchmark
$ cd benchmark
$ npm install
$ npm start # shows prompt
$ npm start [-- <args>]  # runs many to many benchmark tests
$ npm start test <server> <benchmark> [-- <args>]  # runs one to one benchmark test
```

### Arguments

```
-c, --connections The number of concurrent connections to use. default: 10.
-p, --pipelining  The number of pipelined requests to use. default: 1.
-d, --duration    The number of seconds to run the autocannnon. default: 10.
-h, --help        output usage information
```

### Environment Variables

```
PARSE_APP_NAME: 'Parse Server Benchmark',
PARSE_APP_ID: 'app-id',
PARSE_JAVASCRIPT_KEY: 'javascript-key',
PARSE_MASTER_KEY: 'master-key',
PARSE_PORT: 1337,
SERVER_URL: 'http://localhost:1337`,
DATABASE_URL: 'postgres://localhost:5432/parse_benchmark',
MONGODB_URI: 'mongodb://localhost:27017/parse_benchmark',
VERBOSE: false,
CLEAR: false, # If set clears database before each test
```

## Debugging

You can track the progress of your benchmark setting the `DEBUG=1` environment variable.

You can generate detailed server logs by setting `VERBOSE=1`.

## TODO

You can track the progress of this project [here](https://github.com/parse-community/benchmark/projects)
