import type { MessengerClientConfig } from './index'
import type { PluginConfig } from './di'

type GlobPattern = string
type PkgFlexGlobs = GlobPattern[] | '*'
type PkgName = string
type SemverReleaseType = 'minor' | 'major' | 'patch'

export interface RepoStorageDef {
  type: 'repo',
  dest?: string,
}

export interface BranchStorageDef {
  type: 'branch',
  branch: string,
  dest?: string,
}

export interface ExternalStorageDef {
  type: 'external',
}

export type StorageDef = RepoStorageDef | BranchStorageDef | ExternalStorageDef

export interface ChangelogRendererBuiltin {
  type: 'builtin.list' | 'builtin.list-with-packages',
  tag_head_level: number,
  show_date: boolean,
}

export interface ChangelogRendererCommonJs {
  type: 'commonjs',
  path: string,
}

export interface ChangelogRendererByPlugin {
  type: 'by-plugin',
  // should start with "changelog."
  providesPath: string,
}

export type ChangelogRenderer = ChangelogRendererBuiltin | ChangelogRendererCommonJs | ChangelogRendererByPlugin

export interface ArtifactLimitDef {
  type: 'time' | 'size',
  value: string,
}

export type MessengerName = string

export interface Changelog {
  /**
   * Включает рендер чейнджлога
   */
  enabled: boolean,
  /**
   * Путь до генерируемого файла чейнджлога
   */
  path: string,
  /**
   * Storage settings
   */
  storage: StorageDef,
  /**
   * Не помещать записи без изменений в чейнджлог
   */
  skip_empty: boolean,
  /**
   * Настройка рендерера
   */
  renderer: ChangelogRenderer,
  /**
   * Контент, который нужно поместить в начало файла чейнджлога
   */
  front_matter: string,
  /**
   * Настройки чейндлжлога для каждого пакета в отдельности
   */
}

export interface MessengerClientLoadConfig {
  /**
   *  Name of client. Used in matching with `MessengerName` in `messaging.target` and in `messaging.defaults`. Also
   *  used in logging errors.
   */
  name: string,
  /**
   * Path to module or file which exports MessengerClient field. MessengerClient should inherit from AbstractMessengerClient
   * in order to guarantee fit to use cases and to be compatible with current version of pvm.
   */
  pkg: string,
}

/**
 * Configuration schema.
 */
export interface Config {
  versioning: {
    /**
     * `unified = true` or `unified = [<pkg-selector list>] will create the "main" group of packages, by default including all packages,
     * within which all packages will have the same version.
     * If there are options `unified_versions_for` and/or `independent_packages` then these will create additional groups,
     * packages from which will be excluded from the main group.
     * This will also cause the release tags to be equal to the version of the main group of packages with the `v` prefix.
     */
    unified: boolean | GlobPattern[],
    /**
     * List of groups, each group is a list of globs or just one glob string for workspace paths, where each of group have own unified versioning.
     * If you want unified versioning for whole repository, choose ['*'] value or better set `unified` setting to true.
     */
    unified_versions_for: PkgFlexGlobs[],
    /**
     * Where do the versions come from. Also affects the way the versions are saved. See versioning section in documentation for more info.
     */
    source: 'package' | 'tag' | 'file',
    /**
     * Where from and where to save versions if source equals `file`.
     */
    source_file: string,
    /**
     * Packages who always use independent versioning regardless of `unified_versions_for` or `unified` settings.
     */
    independent_packages: GlobPattern[],
  },
  tagging: {
    /**
     * If you don't use the `versioning.unified = true` setting, this option will cause the version of given package to be used as release tags prefixed with `v`.
     * The package must exist, otherwise a runtime exception will be thrown.
     * If `versioning.unified = true` is used, the setting will be ignored in favor of the version of the main package group
     * (see the description of the versioning.unified setting).
     */
    release_tag_package: string,
    /**
     * How deep to look for the version in the release tags annotations, if no version for the package can be found
     * @type integer
     */
    annotation_lookup_depth: number,
    /**
     * Suffixes for release tags, could be name of package which exports list of strings
     * or it could be explicit list of strings
     */
    suffixes: PkgName | string[],
    /**
     * To be used only if all conditions are met:
     * 1. Value `versioning.unified` = false.
     * 2. Value `tagging.release_tag_package` is not set.
     * 3. Repository can have packages of different versions according to pvm settings.
     */
    generic_tag: {
      /**
       * Release tag prefix
       */
      prefix: string,
      /**
       * Date follows after prefix, delimited by '-' symbol
       */
      date_format: string,
      /**
       * @deprecated
       */
      suffixes?: PkgName | string[],
    },
    for_packages: {
      /**
       * If enabled add tag for each package in {pkg.name}-v{semver} format
       */
      enabled: boolean,
      /**
       * Add as release in source code platform. Otherwise only as git tag.
       */
      as_release: boolean,
      /**
       * Strip namespaces from package name
       */
      strip_namespace: boolean,
    },
  },
  publish: {
    /**
     * Registry for publishing if not specified in publishConfig.registry field of package.json
     */
    registry?: string,
    /**
     * Do not perform publish for packages that matches specified [locators](/book/glossary.md#locators).
     */
    disabled_for: GlobPattern[],
    /**
     * Patterns list for published packages. If not empty then only those packages, that match [locators](/book/glossary.md#locators), are going to publish
     */
    enabled_only_for: GlobPattern[],
    /**
     * Subdirectory to publish. This value is appended to each publish path after "path_mapping" options have been applied
     */
    path_subdir?: string,
    /**
     * By default publish path for each package and package path itself is same thing.\nBut you can replace the beginning of each package path to another string via providing this argument.\nExample: 'src/components' => 'lib/components'"
     */
    path_mapping?: Record<string, string>,
    /**
     * Used only if your npm version less than v6.7.0 and you don't have email in npm conf files,\nas npm of these versions fails to publish without email in settings"
     *
     * @format email
     */
    email?: string,
    /**
     * Additional cli args string. Passed "as is" to `npm publish` command
     */
    cli_args?: string,
    /**
     * Use NPM_TOKEN environment variable for result auth npm config calculation
     */
    process_npm_token?: boolean,
    /**
     * Allow to publish monorepo root. By default this is impossible
     */
    include_monorepo_root: boolean,
  },
  core: {
    /**
     * Dependency lists that should be updated and used when package version updates
     */
    deps_keys: Array<'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies' | string>,
  },
  pkgset: {
    /**
     * Exclude files from changed files list. Affects calculation of package sets
     */
    ignore_files: GlobPattern[],
    affected_files: Array<{
      /**
       * Glob files patterns list of what is changed
       */
      if_changed: GlobPattern[],
      /**
       * Glob files patterns list of which files should be counted as changed when files in `if_changed` section touched.
       * Can be list of glob patterns or a string `*` which means, that all packages would be returned
       */
      then_affected: PkgFlexGlobs,
    }>,
  },
  // todo: Перенести в секцию update
  release: {
    /**
     * Before pushing changes, check for upstream branch is still actual
     */
    ensure_branch_up_to_date: boolean,
    /**
     * Do not commit any worktree changes via vcs
     */
    tag_only: boolean,
  },
  update: {
    /**
     * Type of version change according to semver
     */
    default_release_type: 'minor' | 'major' | 'patch',
    /**
     * Include root pkg depending on file changes
     */
    include_root: 'auto' | boolean,
    /**
     * Include uncommited files into changed packages calculation
     */
    include_uncommited: boolean,
    /**
     * Update dependant packages of changed. If provided list of objects with `match` property where `match` is [universal selector](/book/glossary.md) then only for those who match these selectors will dependants be updated
     */
    update_dependants: boolean | Array<{
      /**
       * Packages [universal selector]([universal selector](/book/glossary.md)
       */
      match: GlobPattern,
      /**
       * Dependant release type. If not set then update.dependants_release_type is used. 'as-dep' means use same version as in changed dependency.
       */
      release_type: SemverReleaseType | 'as-dep' | 'none',
    }>,
    /**
     * Git ref for changed calculations when no previous release exists. Or false if pvm should calculate it by itself.
     */
    no_release_ref: string | false,
    /**
     * How to increment version of dependant packages. 'as-dep' means use same version as in changed dependency.
     */
    dependants_release_type: SemverReleaseType | 'as-dep',
    /**
     * File which can configure release process per merge-request
     */
    hints_file: string,
    /**
     * Use special release files, that are force semver release type of package. If disabled, than these files are ignored.
     */
    workspace_release_files: boolean,
    /**
     * Lint and fix packages package.json files before update and commit them
     */
    autolint: boolean,
    /**
     * Downgrade semver release type by one level if major part in package version is zero. Major to minor, and minor to patch.
     */
    respect_zero_major_version: boolean,
    /**
     * Perform commits via vcs platform api (gitlab, github etc.)
     */
    commit_via_platform: boolean,
    /**
     * Git remote path that is used in git push. Calculated automatically if not specified.
     */
    push_remote: string,
    /**
     * Retry operation via platform if vcs operation failed
     */
    retry_via_platform_if_failed_via_vcs: boolean,
    /**
     * Override calculated release type
     *
     * @example
     * {
     *   type: 'none',
     *   files_match: ['**\/__*__\/**', '**\/*.md']
     * }
     */
    release_type_overrides: Array<{
      type: SemverReleaseType | 'none',
      files_match: GlobPattern[],
    }>,
    /**
     * Updated packages graph settings
     */
    graph: {
      title: string,
      strip_namespace: boolean,
    },
  },
  release_list: {
    /**
     * Enable storing releases meta-info in specified storage (right now only git repository is supported)
     */
    enabled: boolean,
    /**
     * Path to release list artifact file
     */
    path: string,
    /**
     * How to limit entries count in release list
     */
    limit: ArtifactLimitDef,
    /**
     * Storage settings
     */
    storage: StorageDef,
  },
  /**
   * Changelog generator settings
   */
  changelog: Changelog & {
    /**
     * Changelog settings for packages individually
     */
    for_packages: Omit<Changelog, 'path' | 'storage'> & {
      /**
       * Output dir for individual package changelog files
       */
      output_dir: string,
    },
  },
  /**
   * Version control system settings
   */
  vcs: {
    /**
     * Version system type
     */
    builtin_type: 'auto' | 'git' | 'fs',
  },
  git: {
    push: {
      /**
       * Try to load system ssh keys
       */
      try_load_ssh_keys: boolean,
      /**
       * Default push branch if you try to
       *
       * todo: ask reason for this setting
       */
      default_branch: string,
    },
  },
  mark_pr: {
    /**
     * Enable various checks of repo packages. In particular check sync of versions between packages. Mark-pr will print warnings
     * in case of problems detected.
     */
    analyze_update: boolean,
    /**
     * Output table of packages with following info: package name, package version, release type, update reason
     */
    packages_table: boolean,
    /**
     * Attach changelog to pull request
     */
    attach_changelog: boolean,
    /**
     * Add package names as labes to pull request
     */
    packages_as_labels: boolean,
    /**
     * Attach package deps graph to pull request
     */
    packages_graph: boolean,
    /**
     * Changelog render settings
     */
    renderer: ChangelogRenderer,
  },
  /**
   * @deprecated please use [plugins_v2](/api/interfaces/pvm_pvm.Config.md#plugins_v2)
   */
  plugins: {
    local_plugins: string[],
    options: Record<string, Record<string, string>>,
  },
  plugins_v2: PluginConfig[],
  templating: {
    /**
     *  Use shot package names ("short" means without namespace part)
     */
    use_short_names: boolean,
    /**
     * Path to script that can add templates extra variables, filters etc. (See https://mozilla.github.io/nunjucks/templating.html and nunjucks.Environment for more)
     */
    setup_script?: string,
    filters: {
      cutList: {
        /**
         * Max list length, passed to cutList template filter
         */
        maxLen: number,
      },
    },
    vars: {
      [key: string]: string | number | undefined,
      releaseLink?: string,
    },
  },
  /**
   * Templates
   * See https://mozilla.github.io/nunjucks/templating.html for template engine docs
   * See packages/pvm-template/lib/env.ts for extra filters and variables
   */
  templates: {
    /**
     * todo: Привести к единому формату нейминга (дефисы в нижнее подчеркивание)
     */
    /**
     * Release notes template
     */
    'pkg-update-deps': string,
    /**
     * Release commit template
     */
    'release-commit': string,
    /**
     * If vcs push failed then render error message for slack with this template
     */
    failed_vcs_push: string,
  },
  jira: {
    /**
     * jira url. If set, then jira-task ids will be transformed into links.
     */
    url?: string,
  },
  gitlab: {
    /**
     * Gitlab url. Used to api requests, and repo entities links if url or api_url are not set.
     */
    default_url: string,
    /**
     * Gitlab api path
     */
    api_prefix: string,
    /**
     * Gitlab authorization type
     */
    authorization_type: 'bearer' | 'private-token',
    /**
     * Separete url used as gitlab api endpoint
     */
    api_url?: string,
    /**
     * Forced url endpoint. If not specified then additional calculation will be performed.
     */
    url?: string,
  },
  github: {
    /**
     * Supported github authorization strategies. See https://github.com/octokit/authentication-strategies.js/ for
     * more info.
     *
     * @default env.CI ? 'authAction' : 'authToken'
     */
    auth_strategy?: 'authApp' | 'authToken' | 'authAction',
    /**
     * Optional url of github server
     */
    api_url?: string,
  },
  /**
   * See https://api.slack.com/methods/chat.postMessage#arguments
   * @deprecated Use @notifications.clients_common_config instead
   */
  slack_notification?: Record<string, string>,
  /**
   * How to deal with messages.
   */
  notifications: {
    /**
     * Which clients use to send messages:<br />
     * `all` - all provided and ready to use clients.<br />
     * `first_available` - find first ready client (order determined by order of clients in notifications.clients config) and use it.<br />
     * `MessengerName` or list of names - try to send message through specified clients.<br />
     * <br />
     * In all cases `ready` client means all necessary env variables or configuration values are provided. If message
     * not sent to messenger you expect to - look at log output
     */
    target: 'all' | 'first_available' | Array<MessengerName> | MessengerName,
    /**
     * Messenger client load configs
     */
    clients: Array<MessengerClientLoadConfig>,
    /**
     * Common config which applied to all messenger clients. For example channel name is same in several messengers and you
     * dont want to duplicate it
     */
    clients_common_config: Partial<MessengerClientConfig>,
    /**
     * Default message values, each for specific messenger client. Its priority is higher than clients_common_config.
     */
    client_configs: Record<MessengerName, Partial<MessengerClientConfig>>,
  },
  /**
   * Options that need more attention in terms of the consequences of their activation.
   */
  dangerously_opts: {
    /**
     * A glob mask array that defines the packets that the system will interpret as always modified.
     * The mask will be applied to the path of the packages (workspaces).
     * This setting will affect the following places:
     * - getPackages method in '@pvm/pvm' (except 'released' and 'updated' types)
     * - pvm-update or pvm-release commands and update mechanic
     */
    always_changed_workspaces?: string[],
  },
  /**
   * External configuration paths
   */
  include?: string[],
  packages?: {
    /**
     * Ident for package.json write
     * @deprecated
     * @type integer
     */
    indent?: number,
  },
}
