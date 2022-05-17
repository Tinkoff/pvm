#!/usr/bin/env bash

echo "Building docs.."

pushd website
yarn --pure-lockfile && BABEL_DISABLE_CACHE=1 yarn build || exit 1
popd
