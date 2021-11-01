<p align="center">
  <img alt="Parse Platform" src="https://raw.githubusercontent.com/parse-community/benchmark/master/.github/logo-large.png" width="200">

<h2 align="center">Benchmark for Parse Server</h2>
    A HTTP/1.1 benchmarking tool for Parse Server backends.
</p>
<br>

---
[![Build Status](https://github.com/parse-community/benchmark/workflows/ci/badge.svg?branch=master)](https://github.com/parse-community/benchmark/actions?query=workflow%3Aci+branch%3Amaster)
[![Coverage](https://img.shields.io/codecov/c/github/parse-community/benchmark/master.svg)](https://codecov.io/github/parse-community/benchmark?branch=master)
[![License](https://img.shields.io/badge/license-BSD-lightgrey.svg)](LICENSE.md)

[![Backers on Open Collective](https://opencollective.com/parse-server/backers/badge.svg)](https://opencollective.com/parse-server)
[![Sponsors on Open Collective](https://opencollective.com/parse-server/sponsors/badge.svg)](https://opencollective.com/parse-server)
[![Forum](https://img.shields.io/discourse/https/community.parseplatform.org/topics.svg)](https://community.parseplatform.org/c/parse-server)
[![Twitter](https://img.shields.io/twitter/follow/ParsePlatform.svg?label=Follow&style=social)](https://twitter.com/intent/follow?screen_name=ParsePlatform)

---

## Getting Started

Parse Benchmark is a highly configurable tool for testing Parse Server [instances][server] against different [load tests][benchmark].

This tool also features a trigger bot that queues merged pull requests on [Parse Server][parse-server] repo and runs benchmarks.

The results can be view on the benchmark [website][website].

### Setup Mongodb

```
$ npm install -g mongodb-runner
$ mongodb-runner start
```
***Note:*** *If installation with* `-g` *fails due to permission problems* (`npm ERR! code 'EACCES'`), *please refer to [this link][npm-permissions].*


### Setup PostgreSQL

Install [PostgreSQL][postgres].
If you have Mac the [PostgreSQL App][postgres-app] is recommended.
```
$ psql -c 'create database parse_benchmark;' -U postgres
$ psql -c 'CREATE EXTENSION postgis;' -U postgres -d parse_benchmark
$ psql -c 'CREATE EXTENSION postgis_topology;' -U postgres -d parse_benchmark
```

## Running Benchmark

### Locally

```
$ git clone https://github.com/parse-community/benchmark.git
$ cd benchmark
$ npm install
$ npm start
```

### Usage

```
-c, --connections The number of concurrent connections to use. default: 10.
-p, --pipelining  The number of pipelined requests to use. default: 1.
-d, --duration    The number of seconds to run the autocannnon. default: 10.
-o, --output      Output to JSON file. default: result.json
-h, --help        output usage information
```

#### One to One Benchmark

You can pass in the file name of the [server][server] and [benchmark][benchmark] to test against.

```
$ npm start -- test <server> <benchmark> <args>  # runs one to one benchmark test
```

Example: [servers/mongo][server] [benchmarks/get][benchmark]

```
# 100 connections, 1 thread, run for 20 seconds
$ npm start -- test mongo get -c 100 -p 1 -d 20
```

#### All Benchmarks

```
$ npm start -- run <args> 
```

#### Connect to any server

This tool uses [autocannon][autocannon] under the hood. You can pass options directly to run against any server.

The is a sample json file [options.sample.json](options.sample.json).

Learn more about options [here][autocannon-options].

```
$ npm start -- options <path to json> <args> 
```

### Environment Variables

```
PARSE_APP_NAME: 'Parse Server Benchmark',
PARSE_APP_ID: 'app-id',
PARSE_JAVASCRIPT_KEY: 'javascript-key',
PARSE_MASTER_KEY: 'master-key',
PARSE_MOUNT_PATH: '/',
PARSE_PORT: 1337,
SERVER_URL: 'http://localhost:1337`,
DATABASE_URL: 'postgres://localhost:5432/parse_benchmark',
MONGODB_URI: 'mongodb://localhost:27017/parse_benchmark',
COLLECTION_PREFIX: 'test_',
VERBOSE: false,
CLEAR: false, # If set clears database before each test
```

## Debugging

You can track the progress of your benchmark setting the `DEBUG=1` environment variable.

You can generate detailed server logs by setting `VERBOSE=1`.

## Roadmap

You can track the progress of this project [here][project].

[autocannon]: https://github.com/mcollina/autocannon
[autocannon-options]: https://github.com/mcollina/autocannon#usage
[benchmark]: https://github.com/parse-community/benchmark/tree/master/benchmarks
[project]: https://github.com/parse-community/benchmark/projects
[server]: https://github.com/parse-community/benchmark/tree/master/servers
[parse-server]: https://github.com/parse-community/parse-server
[website]: http://benchmark.parseplatform.org
[npm-permissions]: https://docs.npmjs.com/getting-started/fixing-npm-permissions
[postgres]: https://www.postgresql.org/download/
[postgres-app]: https://postgresapp.com
