/**
 * Env variables, used by pvm
 *
 * ## [Defaults](config/env-defaults.md)
 */
export interface Env {
  /**
   * Slack bot token that have post message access in target channel
   */
  SLACK_TOKEN?: string,
  /**
   * @see SLACK_TOKEN
   */
  PVM_SLACK_TOKEN?: string,
  /**
   * @deprecated use SLACK_TOKEN instead
   */
  SLACK_WEBHOOK_URL?: string,
  /**
   * @see SLACK_WEBHOOK_URL
   */
  PVM_SLACK_WEBHOOK_URL?: string,
  /**
   * @deprecated use SLACK_TOKEN instead
   */
  SLACK_WEBHOOK?: string,
  /**
   * @see SLACK_WEBHOOK
   */
  PVM_SLACK_WEBHOOK?: string,
  /**
   * Slack api server url
   */
  SLACK_API_URL?: string,
  /**
   * @see SLACK_API_URL
   */
  PVM_SLACK_API_URL?: string,
  /**
   * If provided than mattermost client will try first to get channel id from team and passed channel and, if failed,
   * then try to use channel as channel_id.
   */
  PVM_MATTERMOST_TEAM?: string,
  /**
   * Private access token for mattermost. Can be bot or regular user token
   */
  PVM_MATTERMOST_TOKEN?: string,
  /**
   * Mattermost endpoint url. Will be postfixed with api method path
   */
  PVM_MATTERMOST_URL?: string,
  /**
   * Optional incoming webhook. https://docs.mattermost.com/developer/webhooks-incoming.html.
   * It will be used prior to token if specified
   */
  PVM_MATTERMOST_INCOMING_WEBHOOK?: string,
  /**
   * Flag that script running in continuous integration environment
   */
  CI?: 'true' | 'false',
  /** @see CI */
  GITLAB_CI?: 'true' | 'false',
  /**
   * Git ref of commit on which pipeline running
   */
  CI_COMMIT_REF_NAME?: string,
  /**
   * Vcs platform project url (example: https://example.com/some-org/some-project)
   */
  CI_PROJECT_URL?: string,
  /**
   * Project ID in vcs platform. Used in calls to vcs platform api.
   */
  CI_PROJECT_ID?: string,
  /**
   * Host of CI server
   */
  CI_SERVER_HOST?: string,
  /**
   * The project namespace with the project name included
   */
  CI_PROJECT_PATH?: string,
  /**
   * Url of pipeline where pvm running
   */
  CI_PIPELINE_URL?: string,
  /**
   * The commit tag name. Available only in pipelines for tags
   */
  CI_COMMIT_TAG?: string,
  /**
   * The SHA of commit where pipeline running
   */
  CI_COMMIT_SHA?: string,
  /**
   * The project namespace (username or group name)
   */
  CI_PROJECT_NAMESPACE?: string,
  /**
   * The project name
   */
  CI_PROJECT_NAME?: string,
  /**
   * Enable dry run mode for all pvm commands who support's it
   */
  PVM_EXTERNAL_DRY_RUN?: string,
  /**
   * Log out all shell commands
   */
  PVM_OUTPUT_ALL_RUN_SHELL_COMMANDS?: string,
  /**
   * Flag that pvm running in testing environment
   */
  PVM_TESTING_ENV?: string,
  /**
   * Replace current time with provided. Useful in tests.
   */
  PVM_TEST_DATE_NOW?: string,
  /**
   * Used when we want to do real publish to registry in tests (useful in e2e publish test)
   */
  PVM_FORCE_TEST_PUBLISH?: string,
  /**
   * What directory pvm config to search from. Default is current working directory.
   */
  PVM_CONFIG_SEARCH_FROM?: string,
  /**
   * looks like
   * @deprecated
   */
  PVM_DIRECT_GIT_PUSH?: string,
  /**
   * Manually set vcs type (git or local fs)
   */
  PVM_VCS_TYPE?: 'fs' | 'git',
  /**
   * Manually set vcs platform type (gitlab or github)
   */
  PVM_PLATFORM_TYPE?: 'gitlab' | 'github' | string,
  /**
   * Gitlab specific. Amount of commits that are fetching in CI environment. Useful when amount commits between releases is big enough ' +
   'that previous release falls outside of fetched commits count.
   */
  GIT_DEPTH?: string,
  /**
   * Logging level
   */
  PVM_LL?: string,
  /**
   * If set with 'pvm' string, then treated as PVM_LL=debug
   */
  DEBUG?: string,
  /**
   * Disable default `get fetch` call before pvm starts work when in CI
   */
  PVM_NO_GIT_FETCH?: 'true' | 'false',
  /**
   * Access token for test repo
   */
  PVM_GITHUB_TEST_REPO_TOKEN?: string,
  /**
   * SSH private key to push to vcs platform from CI via git
   */
  GIT_SSH_PRIV_KEY?: string,
  /**
   * NPM registry token with publish access
   */
  NPM_TOKEN?: string,
  /**
   * Token, provided by github and used for token authentication https://github.com/octokit/authentication-strategies.js/#github-action-authentication
   *
   * It can also be personal or app access token, manually provided via secrets
   */
  GITHUB_TOKEN?: string,
  /**
   * Auth strategy options.
   */
  GITHUB_AUTH?: string,
  /**
   * Github authentication strategy. See https://github.com/octokit/authentication-strategies.js/ for more details
   */
  PVM_GITHUB_AUTH_STRATEGY?: 'authApp' | 'authToken' | 'authAction',
  /**
   * The owner and repository name. For example, octocat/Hello-World.
   */
  GITHUB_REPOSITORY?: string,
  /**
   * A unique number for each run within a repository. This number does not change if you re-run the workflow run
   */
  GITHUB_RUN_ID?: string,
  /**
   * The commit SHA that triggered the workflow
   */
  GITHUB_SHA?: string,
  /**
   * Returns the URL of the GitHub server. For example: https://github.com.
   */
  GITHUB_SERVER_URL?: string,
  /**
   * The type of ref that triggered the workflow run. Valid values are branch or tag
   */
  GITHUB_REF_TYPE?: 'branch' | 'tag',
  /**
   * The branch or tag name that triggered the workflow run.
   */
  GITHUB_REF_NAME?: string,
  /**
   * The head ref or source branch of the pull request in a workflow run. This property is only set when the event that triggers a workflow run is either pull_request or pull_request_target. For example, feature-branch-1.
   */
  GITHUB_HEAD_REF?: string,
  /**
   * User or bot gitlab token, that have access rights for creating merge requests and commiting to protected branches
   */
  GITLAB_TOKEN?: string,
  /** @see GITLAB_TOKEN */
  GL_TOKEN?: string,
  /**
   * Email of gitlab user, who start's publish pipeline
   */
  GITLAB_USER_EMAIL?: string,
  /**
   * Shell command that outputs generated GITLAB_TOKEN. Used when token generating dynamically.
   */
  GITLAB_AUTH_COMMAND?: string,
  /**
   * Set lower commits bound when generating fresh releases list
   */
  STOP_AT?: string,
}
