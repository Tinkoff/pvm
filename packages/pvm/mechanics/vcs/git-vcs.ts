import fs from 'fs'
import { mkdirp, escapeFilePath } from '../../lib/fs'
import path from 'path'
import assert from 'assert'
import semver from 'semver'

import { bindToCwd, shell as __shell } from '../../lib/shell'
import __runShell from '../../lib/shell/run'
import __execShell from '../../lib/shell/exec'

import { logger } from '../../lib/logger'
import { mema } from '../../lib/memoize'
import revParse from '../../lib/git/rev-parse'
import { addTag, getCurrentBranchIgnoreEnv, gitFetch } from '../../lib/git/commands'
import { getGitVersion } from '../../lib/runtime-env/versions'

import type { AbstractVcs, AddTagOptions, CommitResult, PushOptions, CommitOptions, Config } from '../../types'
import { env } from '../../lib/env'

import type { RESOLVE_PUSH_REMOTE_TOKEN } from '../../tokens'

const gitlabPushWithoutKeyDesc: {
  ru: string,
  _: string,
} = {
  'ru': `Вы пытаетесь отправить изменения через git на gitlab раннере. Однако, по умолчанию из гитлаб раннеров нельзя отправлять изменения через git протокол (см. https://gitlab.com/gitlab-org/gitlab-foss/-/issues/63858).

Если операция не пройдет, сделайте следующее:
1. Создайте публичные и приватные ключи следуя инструкции описанной здесь: https://gitlab.com/help/ssh/README
2. Добавьте сгенерированный ключ на странице Settings -> CI / CD проекта.
   Замечание: ключ хоть и добавляется на странице конкретного проекта, он будет доступен и для других проектов в пространстве.
3. Активируйте добавленный ключ для нужных вам проектов. Не забудьте проставить опцию "Write access allowed".
4. Добавьте переменную окружения GIT_SSH_PRIV_KEY на странице Settings -> CI / CD проекта со значением равным приватному ключу добавленному на втором шаге.
   Переменную можно пометить как "protected", т.к. нужна она будет только для команды \`pvm update\`/\`pvm release\` которые обычно выполняются в master/main ветке проекта.

После этого PVM будет использовать этот ключ для отправки изменений через git протокол.`,
  '_': `You are trying to push changes through git on gitlab runner. However, by default you cannot send changes via the git protocol (see https://gitlab.com/gitlab-org/gitlab-foss/-/issues/63858).

If the operation fails, do the following:
1. Create public and private keys following the instructions described here: https://gitlab.com/help/ssh/README.
2. Add the generated key on the Settings -> CI / Project CD page.
   Note: although a key is added to a specific project page, it will be available for other projects in the space.
3. Activate the added key for the projects you need. Do not forget to check "Write access allowed" option.
4. Add environment variable GIT_SSH_PRIV_KEY on page Settings -> CI / CD of the project with value equal to private key added on the second step.
   Variable can be marked as "protected" because it will be needed only for \`pvm update\`/\`pvm release\` command which are usually executed in master/main branch of the project.

After that PVM will use this key to send changes via git protocol.
`,
}

export interface GitCommitContext {
  initialRev: string,
  stashRef: string,
}

enum PushOptionsVersion {
  NOT_SUPPORTED,
  LONG_KEY,
  SHORT_KEY,
}

function getPushOptionsVersion(): PushOptionsVersion {
  const gitVersion = getGitVersion()
  if (!gitVersion) {
    return PushOptionsVersion.NOT_SUPPORTED
  }
  if (semver.lt(gitVersion, '2.10.0')) {
    return PushOptionsVersion.NOT_SUPPORTED
  }
  if (semver.lt(gitVersion, '2.18.0')) {
    return PushOptionsVersion.LONG_KEY
  }
  return PushOptionsVersion.SHORT_KEY
}

function stringifyPushOptions(pushOptions: Map<string, string | true>): string[] {
  const pushOptionsVersion = getPushOptionsVersion()
  if (pushOptionsVersion === PushOptionsVersion.NOT_SUPPORTED) {
    if (pushOptions.size > 0) {
      logger.error([
        `You have push options, but your git version ${getGitVersion()} doesn't support push-options.`,
        `Please upgrade git to latest version. Minimum required version is 2.10.0 or better 2.18.0`,
      ].join('\n'))
    }
    return []
  }

  const prefix = pushOptionsVersion === PushOptionsVersion.SHORT_KEY ? '-o ' : '--push-option='

  return Array.from(pushOptions.entries()).map(([key, value]) => {
    return `${prefix}"${key}${value === true ? '' : `=${value}`}"`
  })
}

function prepareGit(cwd: string): void {
  const shell = bindToCwd(cwd, __shell)

  let needDefineUserName
  try {
    needDefineUserName = !shell('git config user.name')
  } catch (e) {
    needDefineUserName = true
  }

  let needDefineUserEmail
  try {
    needDefineUserEmail = !shell('git config user.email')
  } catch (e) {
    needDefineUserEmail = true
  }

  if (needDefineUserName) {
    shell('git config user.name "PVM Service"')
  }
  if (needDefineUserEmail) {
    shell('git config user.email "pvm@pvm.service"')
  }
}

export class GitVcs implements AbstractVcs<GitCommitContext> {
  private gitPrepared = false
  protected shell: typeof __shell
  protected runShell: typeof __runShell
  protected execShell: typeof __execShell
  protected cachedShell: typeof __shell
  protected config: Config
  protected cwd: string
  protected resolvePushRemote: typeof RESOLVE_PUSH_REMOTE_TOKEN | null

  // eslint-disable-next-line
  constructor({ config, cwd, resolvePushRemote }: { config: Config, cwd: string, resolvePushRemote: typeof RESOLVE_PUSH_REMOTE_TOKEN | null }) {
    this.config = config
    this.cwd = cwd
    this.resolvePushRemote = resolvePushRemote
    this.shell = bindToCwd(this.cwd, __shell)
    this.runShell = bindToCwd(this.cwd, __runShell)
    this.execShell = bindToCwd(this.cwd, __execShell)
    this.cachedShell = mema(this.shell)
  }

  prepareGitMemo(): void {
    if (!this.gitPrepared) {
      prepareGit(this.cwd)
    }

    this.gitPrepared = true
  }

  async runGit(command: string) {
    this.prepareGitMemo()
    return await this.runShell(command)
  }

  beginCommit(): GitCommitContext {
    this.prepareGitMemo()
    return {
      initialRev: this.getHeadRev(),
      stashRef: this.shell('git stash create'),
    }
  }

  async rollbackCommit(commitContext: GitCommitContext): Promise<void> {
    await this.runGit(`git reset --hard ${commitContext.initialRev}`)
    if (commitContext.stashRef) {
      await this.runGit(`git stash apply ${commitContext.stashRef}`)
    }
  }

  addFiles(_commitContext: GitCommitContext, filePaths: string[]) {
    if (filePaths.length) {
      return this.runGit(`git add ${filePaths.map(escapeFilePath).join(' ')}`)
    }
    return Promise.resolve()
  }

  updateFile(_: GitCommitContext, filePath: string, content: string): Promise<void> {
    mkdirp(path.dirname(filePath))
    fs.writeFileSync(filePath, content)

    return this.runGit(`git add ${filePath}`)
  }

  appendFile(_: GitCommitContext, filePath: string, content: string) {
    mkdirp(path.dirname(filePath))
    fs.appendFileSync(filePath, content)

    return this.runGit(`git add ${filePath}`)
  }

  async deleteFile(_: GitCommitContext, filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      return this.runGit(`git rm ${filePath}`)
    }
  }

  getCurrentBranch(): string | void {
    this.prepareGitMemo()
    return getCurrentBranchIgnoreEnv(this.cwd)
  }

  async commit(_: GitCommitContext, message: string, opts: CommitOptions = {}): Promise<CommitResult> {
    this.prepareGitMemo()

    const { branch } = opts

    const currentBranch = this.getCurrentBranch()
    if (branch && currentBranch) {
      assert.strictEqual(branch, currentBranch)
    }

    // по крайней мере в git v2.25.0 есть бага: опция allow-empty не работает вместе с dry-run
    const commitArgs = [`--file=-`]
    if (opts.allowEmpty) {
      commitArgs.push('--allow-empty')
    }

    await this.runShell(`git commit ${commitArgs.join(' ')}`, { input: message })

    return {
      id: this.getHeadRev(),
    }
  }

  getHeadRev() {
    this.prepareGitMemo()
    return this.shell('git rev-parse HEAD')
  }

  isLastAvailableRef(ref: string): boolean {
    this.prepareGitMemo()
    const rev = revParse(ref, this.cwd)
    return this.cachedShell('git rev-list --max-parents=0 HEAD').indexOf(rev) !== -1
  }

  async push(opts: PushOptions = {}) {
    this.prepareGitMemo()
    const remoteBranch = this.getCurrentBranch() || this.config.git.push.default_branch
    const remoteRepository =
      opts.remote ||
      (this.resolvePushRemote ? await this.resolvePushRemote() : 'origin')

    const pushArgs: string[] = []

    const { pushOptions = new Map() } = opts

    if (opts.skipCi && !pushOptions.has('ci.skip')) {
      pushOptions.set('ci.skip', true)
    }

    pushArgs.push(...stringifyPushOptions(pushOptions))

    if (env.PVM_TESTING_ENV) {
      logger.info('skip pushing in testing env')
      // @TODO: код ниже ломает тесты в условиях гитлаб раннеров ломая евент-луп
      return
    }

    const pushEnv: Record<string, string> = {
      // eslint-disable-next-line pvm/no-process-env
      ...process.env,
      GIT_SSL_NO_VERIFY: '1',
    }

    // если задана переменная PVM_DIRECT_GIT_PUSH то скрипт не будет выполнятся в любом случае
    if (!env.PVM_DIRECT_GIT_PUSH && env.CI && this.config.git.push.try_load_ssh_keys) {
      if (!env.GIT_SSH_PRIV_KEY) {
        // @TODO: i18n support
        const locale = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0].toLowerCase()
        const messageLocale = locale in gitlabPushWithoutKeyDesc ? locale as keyof typeof gitlabPushWithoutKeyDesc : '_'
        logger.warn(gitlabPushWithoutKeyDesc[messageLocale])
      }
      const gitLoadPushCreds = path.resolve(__dirname, './git-load-push-creds.sh')
      const payloadMark = '@----------ssh-agent-data----------@'
      const { stdout } = await this.execShell(gitLoadPushCreds, {
        printStdout: true,
        env: {
          // eslint-disable-next-line pvm/no-process-env
          ...process.env,
          PAYLOAD_MARK: payloadMark,
        },
      })

      const indexOfPayloadMark = stdout.indexOf(payloadMark)
      if (indexOfPayloadMark !== -1) {
        const payload = stdout.substr(indexOfPayloadMark).split(payloadMark)[1]
        if (payload) {
          const [SSH_AUTH_SOCK, SSH_AGENT_PID] = payload.trim().split(';')
          if (SSH_AUTH_SOCK && SSH_AGENT_PID) {
            logger.info('Successfully get ssh-agent identifiers from git-load-push-creds.sh script')
            logger.debug(`SSH_AUTH_SOCK="${SSH_AUTH_SOCK}"`)
            logger.debug(`SSH_AGENT_PID="${SSH_AGENT_PID}"`)
            pushEnv.SSH_AUTH_SOCK = SSH_AUTH_SOCK
            pushEnv.SSH_AGENT_PID = SSH_AGENT_PID
          }
        }
      } else {
        logger.error('No payload mark found produced by execution of git-load-push-creds.sh script')
      }
    }

    if (opts.refspec) {
      await this.runShell(`git push ${pushArgs.join(' ')} ${remoteRepository} ${opts.refspec}`, {
        env: pushEnv,
      })
    } else {
      await this.runShell(`git push ${pushArgs.join(' ')} ${remoteRepository} HEAD:${remoteBranch}`, {
        env: pushEnv,
      })
      if (!opts.noTags) {
        await this.runShell(`git push ${pushArgs.join(' ')} --tags ${remoteRepository}`, {
          env: pushEnv,
        })
      }
    }
  }

  async fetchLatestSha(refName: string): Promise<string> {
    gitFetch(this.cwd, { repo: 'origin' })

    return this.shell(`git rev-parse origin/${refName}`)
  }

  async addTag(tagName: string, ref: string, opts: AddTagOptions = {}): Promise<void> {
    this.prepareGitMemo()
    addTag(this.cwd, {
      tagName,
      ref,
      annotation: opts.annotation,
    })
  }
}

export { prepareGit }
