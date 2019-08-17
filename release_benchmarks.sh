#!/bin/sh -e
set -x
if [ "${TRAVIS_REPO_SLUG}" = "" ];
then
  echo "Cannot release docs without TRAVIS_REPO_SLUG set"
  exit 0;
fi
REPO="https://github.com/${TRAVIS_REPO_SLUG}"

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
npm run benchmark
RESULT=`cat result.json`

# Append result.json to data.json
data+=("$RESULT")

# Save to data.json
printf "%s\n" "${data[@]}" > $OUTPUT_FILE
