---
id: examples
title: Some examples
---

Now then you have installed pvm we can play some examples.
For more convenience, using [yarn](https://yarnpkg.com) for executing pvm.

#### update and commit new versions of packages

```shell
yarn pvm update
```

Updates versions and release notes for all packages changed since release.
Creates the commit and tags on top of that commit.
Release notes are created via API for web-based VCS, for now only gitlab is supported.

#### print packages names for current workspace

```shell
yarn -s pvm pkgset -s all -f '%n'
```

#### publish all outdated packages

```shell
yarn pvm publish -s stale
```
