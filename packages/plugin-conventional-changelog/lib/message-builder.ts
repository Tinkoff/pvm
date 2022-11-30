import { isGenericTagUsed, issueToMdLink, defaultMessageBodyWrapper } from '@pvm/pvm'

import { parseCommit } from './common'

import type { Commit as ConventionalCommit } from 'conventional-commits-parser'
import type { ReleasedProps, Message } from '@pvm/pvm'

function cutText(text: string, maxLen: number): string {
  return text.length <= maxLen ? text : text.substr(0, maxLen)
}

interface MessageBuilderOpts {
  attachPackages?: boolean,
}

interface BodyWrapperParams {
  releaseLink: string | null,
  releaseName: string,
}

type BodyWrapper = (body: string, opts: BodyWrapperParams) => string;

interface BuildMessageOpts {
  attachPackages?: boolean,
  bodyWrapper?: BodyWrapper,
  conventionalCommits?: ConventionalCommit[],
}

async function buildMessage(releaseProps: ReleasedProps, opts: BuildMessageOpts = {}): Promise<Omit<Message, 'channel'>> {
  const { tag, commits, pvmConfig, packagesStats } = releaseProps
  const { cwd } = pvmConfig

  const { bodyWrapper = (x) => x, attachPackages = false, conventionalCommits = [] } = opts

  // tag.slice(19) works like this: `release-09.07.2019-Slayback ` → `Slayback`
  const releaseName = isGenericTagUsed(pvmConfig) ? tag.slice(19) : tag

  const commitsByType: Map<
  string,
  {
    title: string,
    commits: string[],
  }
  > = new Map([
    [
      'feat',
      {
        title: '🚀 Features',
        commits: [],
      },
    ],
    [
      'fix',
      {
        title: '🐛 Bug Fixes',
        commits: [],
      },
    ],
    [
      'perf',
      {
        title: '🏃‍♀️ Performance Improvements',
        commits: [],
      },
    ],
    [
      'revert',
      {
        title: '↩️ Reverts',
        commits: [],
      },
    ],
    [
      'docs',
      {
        title: '📝 Documentation',
        commits: [],
      },
    ],
    [
      'style',
      {
        title: '💅 Styles',
        commits: [],
      },
    ],
    [
      'refactor',
      {
        title: '🛠️ Code Refactoring',
        commits: [],
      },
    ],
    [
      'test',
      {
        title: '🧪 Tests',
        commits: [],
      },
    ],
    [
      'build',
      {
        title: '🧰 Build System',
        commits: [],
      },
    ],
    [
      'ci',
      {
        title: '⚙️ Continuous Integration',
        commits: [],
      },
    ],
    [
      'other',
      {
        title: 'Other',
        commits: [],
      },
    ],
    [
      'notes',
      {
        title: '💥 BREAKING CHANGES',
        commits: [],
      },
    ],
  ])

  const vcs = await initVcsPlatform({
    cwd,
  })
  // eslint-disable-next-line max-statements
  for (const [i, commit] of (commits || []).entries()) {
    const conventionalCommit = conventionalCommits[i]
    const commitLink = await vcs.getCommitLink(commit.commit.long)
    const needAddIssueLink = pvmConfig.jira.url && conventionalCommit && conventionalCommit.references.length
    const hasExtraInfo = commitLink || needAddIssueLink

    let message = commit.subject

    if (pvmConfig.jira.url) {
      message = issueToMdLink(pvmConfig.jira.url, message)
    }

    if (hasExtraInfo) {
      message += ' ('
    }

    if (commitLink) {
      message += `[#${
        commit.commit.short
      }](${commitLink})`
    }

    if (needAddIssueLink) {
      if (commitLink) {
        message += ' '
      }
      message += 'closes '

      conventionalCommit.references.forEach((ref, pI) => {
        const refsSeparator = pI > 0 ? ', ' : ''

        message += `${refsSeparator}[${ref.issue}](${pvmConfig.jira.url}/browse/${ref.issue})`
      })
    }

    if (hasExtraInfo) {
      message += ')'
    }

    // from `fix: commit message` to `message`, or from `fix(a, b): commit message` to `(a, b): commit message`
    if (conventionalCommit.type) {
      message = message.replace(new RegExp(`^(${conventionalCommit.type}: |${conventionalCommit.type})`), '')
    }

    const type = conventionalCommit && conventionalCommit.revert ? 'revert' : conventionalCommit.type

    if (type) {
      if (commitsByType.has(type)) {
        commitsByType.get(type)!.commits.push(message)
      } else {
        commitsByType.get('other')!.commits.push(message)
      }
    } else {
      commitsByType.get('other')!.commits.push(message)
    }

    if (conventionalCommit.notes) {
      conventionalCommit.notes.forEach((n) => {
        let text = ''

        if (conventionalCommit.scope) {
          text = n.text ? `(${conventionalCommit.scope}): ` : conventionalCommit.scope
        }
        if (n.text) {
          text += pvmConfig.jira.url ? issueToMdLink(pvmConfig.jira.url, n.text) : n.text
        }
        if (text) {
          commitsByType.get('notes')!.commits.push(`${text}`)
        }
      })
    }
  }

  let body = ''

  commitsByType.forEach((value) => {
    if (value.commits.length) {
      body += `\n**${value.title}**\n`

      value.commits.forEach((c) => {
        body += `  • ${c}\n`
      })
    }
  })

  const { releaseLink } = pvmConfig.templating.vars

  const attachments: Message['attachments'] = []

  if (attachPackages && packagesStats.success.length > 0) {
    const publishedPackages = packagesStats.success
      .map((desc) => `${desc.pkg}@${desc.publishedVersion}`)
      .join('\n')
    attachments.push({
      title: 'Published packages',
      text: cutText(publishedPackages, 60000),
    })
  }

  return {
    content: bodyWrapper(body, {
      releaseLink: releaseLink ? `[${releaseName}](${releaseLink})` : null,
      releaseName,
    }),
    attachments,
  }
}

export async function releaseMessage(
  releaseProps: ReleasedProps,
  opts: MessageBuilderOpts = {}
): Promise<Omit<Message, 'channel'>> {
  const { pvmConfig, packagesStats } = releaseProps
  const { attachPackages = isGenericTagUsed(pvmConfig) } = opts
  const conventionalCommits = convertCommitsToConvFormat(releaseProps.commits)

  return buildMessage(releaseProps, {
    bodyWrapper: (body, { releaseLink, releaseName }) => {
      return defaultMessageBodyWrapper({
        body,
        releaseName,
        releaseLink,
        packagesStats,
      })
    },
    attachPackages,
    conventionalCommits,
  })
}

function convertCommitsToConvFormat(gitLogCommits: ReleasedProps['commits']): ConventionalCommit[] {
  const rawCommits = (gitLogCommits || []).map((commit) => {
    let message = commit.subject

    if (commit.body) {
      message += `\n\n${commit.body}`
    }

    return message
  })

  return rawCommits.map((commit) => {
    return parseCommit(commit)
  })
}
