import { log } from '../lib/logger'
import { initVcsPlatform } from '../mechanics/vcs'

// eslint-disable-next-line node/no-extraneous-import
import type { Argv } from 'yargs'

async function isBranchActual(): Promise<void> {
  const vcs = await initVcsPlatform()
  const currentBranch = vcs.getCurrentBranch()
  if (currentBranch) {
    const matches = await vcs.isRefMatchesRemoteBranch('HEAD', currentBranch)

    if (!matches) {
      log(`Branch ${currentBranch} doesn't match remote one! Is it outdated ?`)
      process.exitCode = 1
    }
  } else {
    log('No branch detected. Are you in detached head state ?')
    process.exitCode = 1
  }
}

function cliSubargsToMap(args: string[]): Map<string, string | true> {
  const map = new Map<string, string | true>()
  for (const arg of args) {
    const indexOfEq = arg.indexOf('=')
    if (indexOfEq === -1) {
      map.set(arg, true)
    } else {
      const key = arg.substring(0, indexOfEq)
      const value = arg.substr(indexOfEq + 1)
      map.set(key, value)
    }
  }
  return map
}

async function push(flags): Promise<void> {
  const vcs = await initVcsPlatform({
    vcsMode: 'vcs',
  })

  await vcs.push({
    skipCi: flags.skipCi,
    noTags: !flags.tags,
    pushOptions: cliSubargsToMap(flags.pushOption),
    refspec: flags.refspec,
  })
}

export const command = 'vcs <command>'
export const description = 'cli for version control system'
export const builder = (yargs: Argv) => {
  return yargs
    .command(
      'is-branch-actual',
      `Checks current branch is up to date with origin remote one. Exit with code 0 unless branch is stale`,
      {},
      isBranchActual
    )
    .command(
      'push [refspec]',
      'Push current branch & tags via vcs(git) to remote repository. If refspec is passed pushes only it.',
      {
        'skip-ci': {
          default: false,
          type: 'boolean' as const,
          description: 'Do not trigger pipeline for push refs if possible',
        },
        'tags': {
          default: false,
          type: 'boolean' as const,
          description: 'Also push tags',
        },
        'push-option': {
          alias: 'o',
          type: 'array' as const,
          description: `--push-option's for git push command`,
        },
      },
      push
    )
    .demandCommand()
}
export const handler = () => {}
