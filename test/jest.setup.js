const initRepo = require('./initRepo')
const { writeRepo } = require('./writeRepo')
const { runScript, execScript } = require('./executors')
const { writeConfig } = require('./helpers')

global.initRepo = initRepo
global.runScript = runScript
global.execScript = execScript
global.writeConfig = writeConfig
global.writeRepo = writeRepo

Object.assign(process.env, {
  PVM_CONFIG_SEARCH_FROM: __dirname,
  __PVM_ENABLE_INVALIDATE_RELEASES_BUT_IT_MAY_RESULT_IN_A_DENIAL_OF_SERVICE: 'true',
  PVM_CONFIG_JIRA__URL: 'https://jira.example.com',
  PVM_TEST_DATE_NOW: '2018-11-27T12:00:00.000Z',
  // SLACK_WEBHOOK: `http://localhost:${process.env.GITLAB_HTTP_PORT}/slack-hook/`,
  CI_PROJECT_NAMESPACE: 'pfp',
  CI_PROJECT_NAME: 'test-p',
  CI_PROJECT_ID: 111,
  GL_TOKEN: '___gl___',
  PVM_TESTING_ENV: process.env.PVM_TESTING_ENV ?? 'true',
  NPM_TOKEN: '123',
  PVM_LL: process.env.PVM_LL || 'debug',
  PVM_CONFIG_PLUGINS_V2: JSON.stringify([{ plugin: require.resolve('@pvm/gitlab/plugin') }]),
})
