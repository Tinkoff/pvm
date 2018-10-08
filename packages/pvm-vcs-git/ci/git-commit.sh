#!/usr/bin/env bash

set -euo pipefail

if [[ -z `git config user.name` ]]; then
  git config user.name "PVM Service"
fi

if [[ -z `git config user.email` ]]; then
  git config user.email "pvm@pvm.service"
fi

git commit ${GIT_COMMIT_ARGS}
