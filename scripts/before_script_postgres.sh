#!/bin/bash

set -e

echo "[SCRIPT] Before Script :: Setup Parse DB for Postgres"

PGPASSWORD=postgres psql -v ON_ERROR_STOP=1 -h localhost -U postgres <<-EOSQL
    CREATE DATABASE parse_benchmark;
    \c parse_benchmark;
    CREATE EXTENSION pgcrypto;
    CREATE EXTENSION postgis;
    CREATE EXTENSION postgis_topology;
EOSQL
