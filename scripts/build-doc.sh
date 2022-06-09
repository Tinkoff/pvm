#!/usr/bin/env bash

echo "Building docs.."

pushd website
yarn build || exit 1
popd
