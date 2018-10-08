import type { Config } from './config-schema'

export const defaultConfig: Config = {
  versioning: {
    unified: false,
    unified_versions_for: [],
    independent_packages: [],
    source: 'package',
    source_file: 'versions.json',
  },
  tagging: {
    release_tag_package: '',
    annotation_lookup_depth: 30,
    suffixes: '@pvm/suffixes',
    generic_tag: {
      prefix: 'release',
      date_format: 'yyyy.MM.dd',
    },
    for_packages: {
      enabled: false,
      as_release: false,
      strip_namespace: true,
    },
  },
  pkgset: {
    ignore_files: [],
    affected_files: [
      {
        if_changed: [],
        then_affected: [],
      },
    ],
  },
  release: {
    ensure_branch_up_to_date: true,
    tag_only: false,
  },
  update: {
    default_release_type: 'minor',
    include_root: 'auto',
    include_uncommited: false,
    update_dependants: true,
    no_release_ref: false,
    dependants_release_type: 'patch',
    hints_file: 'update-hints.toml',
    workspace_release_files: true,
    autolint: true,
    respect_zero_major_version: false,
    commit_via_platform: true,
    push_remote: '',
    retry_via_platform_if_failed_via_vcs: true,
    release_type_overrides: [],
    graph: {
      title: 'Packages about to update',
      strip_namespace: true,
    },
  },
  core: {
    deps_keys: [
      'dependencies',
      'devDependencies',
    ],
  },
  release_list: {
    enabled: false,
    path: 'releaseList.json',
    limit: {
      type: 'time',
      value: '2 years',
    },
    storage: {
      type: 'repo',
    },
  },
  changelog: {
    enabled: true,
    path: 'changelog.md',
    storage: {
      type: 'repo',
    },
    skip_empty: false,
    renderer: {
      type: 'builtin.list',
      tag_head_level: 2,
      show_date: true,
    },
    front_matter: '',
    for_packages: {
      enabled: false,
      output_dir: 'changelogs',
      skip_empty: false,
      renderer: {
        type: 'builtin.list',
        tag_head_level: 2,
        show_date: true,
      },
      front_matter: '',
    },
  },
  vcs: {
    builtin_type: 'auto',
  },
  git: {
    push: {
      try_load_ssh_keys: false,
      default_branch: 'master',
    },
  },
  mark_pr: {
    analyze_update: false,
    packages_table: true,
    attach_changelog: true,
    packages_as_labels: false,
    packages_graph: false,
    renderer: {
      type: 'builtin.list',
      tag_head_level: 2,
      show_date: true,
    },
  },
  publish: {
    cli_args: '--unsafe-perm',
    disabled_for: [],
    enabled_only_for: [],
    process_npm_token: true,
  },
  plugins: {
    local_plugins: [],
    load_first: [],
    options: {},
  },
  templating: {
    use_short_names: false,
    filters: {
      cutList: {
        maxLen: 4,
      },
    },
    vars: {},
  },
  templates: {
    'pkg-update-deps': 'Update {{ newDepKeys | join(", ") }} {{ newDepKeys | enpl("dependencies", "dependency", "dependencies") }}:\n\n{{ originReleaseNotes }}',
    'release-commit': 'Release {{ packages.values() | toArray | join(", ", "name") | shorten(64) }}\n\nFull list of updated packages:\n{% for oldPkg, newPkg in packages -%}\n  {{ newPkg.name }}@[{{oldPkg.version}} -> {{newPkg.version}}]{{ "" if loop.last else ", " }}\n{% endfor %}',
    failed_vcs_push: 'PVM has failed to push a release commit.\n{% if CI_PIPELINE_URL -%}\nSee [pipeline]({{CI_PIPELINE_URL}}).\n{% endif -%}\n',
  },
  jira: {},
  gitlab: {
    default_url: 'https://gitlab.com',
    api_prefix: '/api/v4',
    authorization_type: 'bearer',
  },
  github: {
    auth_strategy: undefined,
  },
  slack_notification: {},
  slack_auth: {},
  dangerously_opts: {},
  notifications: {
    target: 'first_available',
    clients: [
      {
        name: 'slack',
        pkg: '@pvm/slack',
      },
    ],
    clients_common_config: {},
    client_configs: {},
  },
}
