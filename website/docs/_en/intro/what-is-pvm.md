---
id: what-is-pvm
title: What is pvm ?
---

Pvm is set of cli commands which allows you automate releases for npm-packages for git repositories.
Pvm is supposed to be running in CI server, and perform all the job related to releasing, such as incrementing package version, generating release notes and publishing to npm registry.

Pvm has covered by test scenarios, so you don't have to worry, releasing process is safe.

Pvm supports both multi-package (a.k.a. monorepositories) and single-package repositories.
