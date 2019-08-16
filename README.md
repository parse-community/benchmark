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
$ npm start [-- <args>] or npm test
```

### Arguments

```
-c, --connections The number of concurrent connections to use. default: 10.
-p, --pipelining  The number of pipelined requests to use. default: 1.
-d, --duration    The number of seconds to run the autocannnon. default: 10.
-u, --serverURL   Server URL for Parse Server. default: localhost:1337
```

## Debugging

You can track the progress of your benchmark setting the `DEBUG=1` environment variable.

You can generate detailed server logs by setting `VERBOSE=1`.

## TODO

https://github.com/parse-community/benchmark/projects

This project was built based on [fastily](https://github.com/fastify/benchmarks/)
