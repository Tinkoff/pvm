---
id: update-hints
title: Update hints
---

If you want one or couple of following things to happen 
* Certain packages have concrete update versions
* Concrete packages have concrete version increment
* Some packages, despite affected or not, to have new version and treated as affected. 

Then how you can achieve that?

Two solutions available to this problem:
* First can be applied if `@pvm/plugin-conventional-changelog` used: you can edit commit message or add new to affect
packages you want to update but it is not acceptable in all cases. For example when you want to republish all packages
because of build process changes and when nothing directly used by packages changed. Next approach is more general and robust.
* Second is to use so-called `update-hints` mechanism.

Hints are applied in `pvm update` command call. If hints were in file than this file will be deleted in following commit.
But if `release.tag_only` set to `true` and `versioning.source` is set to `tag`, then there will be no commit and hints file will
leave until one not delete it manually. In this case hints can be placed in merge request description.

## `update-hints.toml` file

`update-hints.toml` is a special file that is commited as usual and merged in merge request.
Below is full example of hints content
```toml
@cli-inline cat packages/pvm-update/cli/hints_file.txt
```

## Merge request description update hints

:::info

At this moment only gitlab is supported

:::

Merge request hints content is superset of file version with following additions

Extra field
```toml
kind = 'pvm-update-hints'
```
and wrap with `toml` code block 
````
```toml
```
````

Example of hints for merge request description with theese additions
````
...[Some description text]

```toml
kind = 'pvm-update-hints'
[release-types]
major = '*'
```
````
