#!/bin/bash -e
REPO="https://dplewis:$GITHUB_TOKEN@github.com/parse-community/benchmark"

echo "REPO: $REPO"

rm -rf docs
git clone -b gh-pages --single-branch $REPO ./docs
cd docs
git pull origin gh-pages
cd ..

OUTPUT_FILE="./docs/data.txt"

# Create data.json file if not exist
if [ ! -e $OUTPUT_FILE ];
then
  touch $OUTPUT_FILE
fi

# Import data from data.json
data=()
while read row; do data+=("$row"); done < $OUTPUT_FILE

echo "SHA1 HASH: $SHA1"

# Run benchmark test to output result.json
npm install --no-save "git://github.com/parse-community/parse-server.git#$SHA1"

# 100 connections, 1 thread, 20 seconds, 40k requests
npm start -c 100 -p 1 -d 20

RESULT=`cat result.json`

# Append result.json to data.json
data+=("$RESULT")

# Save to data.json
printf "%s\n" "${data[@]}" > $OUTPUT_FILE

cd docs

git config user.name "dplewis"
git config user.email "findlewis@gmail.com"
git add .
git commit -m "Benchmark (https://github.com/parse-community/parse-server/commit/$SHA1)"
git push --quiet $REPO
