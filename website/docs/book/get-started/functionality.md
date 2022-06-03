---
id: functionality
title: Supported functionality
---

### General
1. Automatic raising of the package version, saving it and publishing with the new version
2. [Notification](api/modules/pvm_notifications.md) about the publication result
3. Generate [changelog](api/interfaces/pvm_core.Config.md#changelog) and save it
4. [Possibility](api/interfaces/pvm_core.Config.md#versioning) to saving the version without additional commit to the repository
5. Ability to set [alternative path](api/interfaces/pvm_core.Config.md#publish) before the published package
6. Support for different versioning schemes ([semantic-release](api/modules/pvm_plugin_conventional_semantic_release.md), [conventional-commit](api/modules/pvm_plugin_conventional_changelog.md))
9. Extensibility through plugins
10. Preliminary output of the result of future changes to evaluate the correctness through the support of the `--dry-run` flag by most commands
11. Ability to locally execute commands without writing to external services through the commands `pvm local <command>` (list of commands - `yarn pvm local --help`)
12. Integration with code storage platforms ([gitlab](api/modules/pvm_gitlab.md), [github](api/modules/pvm_github.md))

### Monorepository
1. Updating modified packages [taking into account dependencies](api/interfaces/pvm_core.Config.md#update) between them
2. Guaranteed version synchronization in monorepa package dependencies
3. Ability to set [single version](../versioning/version-placeholders.md) packages for some or all packages in the repository
4. [Disable publishing](api/interfaces/pvm_core.Config.md#publish) for some packages
5. Ability to manually override the release type (major, minor, patch, none) for one or a group of packages
6. Support for generating [individual changelog](api/interfaces/pvm_core.Config.md#changelog) for each package