---
id: glossary
title: Glossary
---

## Platform

Development platform.

<div className="customAnchor anchor" id="pkg-selector" />

## Locators

СThe package selector is used in pvm settings to select groups of packages in a monorepository.

There are two kinds of selectors:

### Selectors by package path

Must start with `/`. Examples:

```
/src/core/**/*
/src/utils/*
```

For all the globbing features that you can use, see [here](https://github.com/micromatch/micromatch/tree/3.1.10#matching-features).

### Package name Selectors

Must not start with `/`. Examples:

```
@pvm/*
@pvm/pvm
@pvm/core
```

Globbing works on the same principles as in the case of paths, except for the option [`basename`](https://github.com/micromatch/micromatch/tree/3.1.10#optionsbasename)
– it is included so that `*` matches packets with namespace: i.e. `*` will match all packages, even if they have a namespace.

### Canary release

Release packages with a version like `1.1.0-043fdc15.0`, where `043fdc15` is the commit from which the release is being made. The version will not be saved in the list
releases and will not be included in the changelog.

### Canary index

In the example version `1.1.0-043fdc15.0`, the part after `043fdc15.` is an index and is incremented
in case of publishing a new canary version with the base version and preid unchanged.