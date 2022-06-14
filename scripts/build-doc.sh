#!/usr/bin/env bash

echo "Building docs.."

pushd website
npm ci && BABEL_DISABLE_CACHE=1 npm run build || exit 1
popd
