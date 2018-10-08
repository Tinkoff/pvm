#!/usr/bin/env bash

echo "Building docs.."

pushd website
yarn --pure-lockfile && BABEL_DISABLE_CACHE=1 yarn build --out-dir ../public || exit 1
popd
