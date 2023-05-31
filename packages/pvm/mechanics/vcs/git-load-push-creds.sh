#!/usr/bin/env bash

set -euo pipefail

export GIT_SSL_NO_VERIFY=1
if command -v apt-get &> /dev/null
then
  which ssh-agent || ( apt-get update -y && apt-get install openssh-client -y )
fi
eval $(ssh-agent -s)
if [ -n "$GIT_SSH_PRIV_KEY" ]
then
  ssh-add <(echo "${GIT_SSH_PRIV_KEY}")
  ssh-add -l
else
  echo "There is no GIT_SSH_PRIV_KEY env variable configured. Continue without provided ssh credentials."
fi
if [ -n "$CI_SERVER_HOST" ]
then
  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  ssh-keyscan $CI_SERVER_HOST >> ~/.ssh/known_hosts
  chmod 644 ~/.ssh/known_hosts
fi

echo "$PAYLOAD_MARK"
echo "$SSH_AUTH_SOCK;$SSH_AGENT_PID"
echo "$PAYLOAD_MARK"
