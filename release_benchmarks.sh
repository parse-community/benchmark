#!/bin/bash -e
set -x

REPO="https://dplewis:$GITHUB_TOKEN@github.com/parse-community/benchmark"

rm -rf docs
git clone -b gh-pages --single-branch $REPO ./docs
cd docs
git pull origin gh-pages
cd ..

OUTPUT_FILE="./docs/data.json"

# Create data.json file if not exist
if [ ! -e $OUTPUT_FILE ];
then
  touch $OUTPUT_FILE
fi

# Import data from data.json
data=()
while read row; do data+=("$row"); done < $OUTPUT_FILE

# Run benchmark test to output result.json
npm install --save "git://github.com/parse-community/parse-server.git#$SHA1"
npm run benchmark
RESULT=`cat result.json`

# Append result.json to data.json
data+=("$RESULT")

# Save to data.json
printf "%s\n" "${data[@]}" > $OUTPUT_FILE

cd docs

git config user.name "Travis CI"
git config user.email "github@fb.com"
git add .
git commit -m "Benchmark (https://github.com/parse-community/parse-server/commit/$SHA1)"
git push --quiet
