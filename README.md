# pvm

Pvm is a tool for automating packages version management and publishing for git repositories with one or multiple npm packages.
Main pvm's goal is release any number of packages after pull request get merged. Without any manual efforts!

## Main features

* Can handle both multi-package (a.k.a monorepos) and single-package repositories
* CI-friendly
* Work well with yarn workspaces 
* Update versions of packages and generate release notes since last release
* Publish changed or stale packages
* Visualize changed packages before actual release for answering the question: What would be changed and how after this pull request get merged ?

For quick reference, let's consider a typical CI release workflow for pvm:

### pvm release

Makes a new release, for example after merging pull request to master.

1. Find changed packages since last release then calculate release type and generate release notes (changelog) for them.
1. Update changelog files.
1. Then update packages by calculated release types and commit result, also push release tag with release notes (for now only gitlab is supported).

Supports [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) library for generating release-notes and calculating release types for packages. Just install `pvm-plugin-conventional-changelog` and you are great!

### pvm publish

Publish packages to npm registry.

Some examples:

- `pvm publish -s released` publishes packages have been released in latest release.  Default behavior.
- `pvm publish -s stale` publishes stale packages (where registry version outdated).
- `pvm publish -s all` publish all packages.

Curious ? See [documentation](https://tinkoff.github.io/pvm/) for more detailed information.
