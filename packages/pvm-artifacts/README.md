# @pvm/artifacts

The module provides functionality for loading and unloading release artifacts. In particular changelogs and list of releases.
The module is useful if pushing to the master is disabled or versioning is built through git tags and you do not want additional
commits to master.

Supported Artifact Types:
* Changelogs
* Release lists

Supported artifact storage types:
* git branch in the repository