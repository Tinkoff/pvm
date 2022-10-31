// This file refers to those that you can freely copy to your own project.
import type { Message, ReleasedProps, Commit, PublishedStats } from '@pvm/types'
import { issueToMdLink } from '@pvm/core/lib/text/jira'
import { stripServiceLabels } from '@pvm/core/lib/text/commits'
import { isGenericTagUsed } from '@pvm/core/lib/tag-meta'
import { padLines } from '@pvm/core/lib/text'

import { env } from '@pvm/core/lib/env'

function cutText(text: string, maxLen: number): string {
  return text.length <= maxLen ? text : text.substr(0, maxLen)
}

interface MessageBuilderOpts {
  attachPackages?: boolean,
}

interface BodyWrapperParams {
  releaseLink: string | null,
  releaseName: string,
  registry: string | undefined,
}

type BodyWrapper = (body: string, opts: BodyWrapperParams) => string

export interface BuildMessageOpts {
  attachPackages?: boolean,
  bodyWrapper?: BodyWrapper,
}

function formatCommit(commit: Commit): string {
  const message = [`• ${stripServiceLabels(commit.subject)}`]
  if (commit.body) {
    message.push(padLines(commit.body, 4))
  }

  return message.join('\n')
}

export function buildMessage(releaseProps: ReleasedProps, opts: BuildMessageOpts = {}): Message {
  const { tag, commits, pvmConfig, packagesStats, registry } = releaseProps

  const { bodyWrapper = x => x, attachPackages = false } = opts

  // tag.slice(19) works like this: `release-09.07.2019-Slayback ` → `Slayback`
  const releaseName = isGenericTagUsed(pvmConfig) ? tag.slice(19) : tag

  let body = (commits || []).map(c => {
    return formatCommit(c)
  }).join('\n')
  if (pvmConfig.jira.url) {
    body = issueToMdLink(pvmConfig.jira.url, body)
  }

  const { releaseLink } = pvmConfig.templating.vars

  const attachments: Message['attachments'] = []

  if (attachPackages && packagesStats.success.length > 0) {
    const publishedPacakges = packagesStats.success.map(desc => `${desc.pkg}@${desc.publishedVersion}`).join('\n')
    attachments.push({
      title: 'Published packages',
      text: cutText(publishedPacakges, 12000),
    })
  }

  return {
    content: bodyWrapper(body, {
      releaseLink: releaseLink ? `[${releaseName}](${releaseLink})` : null,
      releaseName,
      registry,
    }),
    attachments,
  }
}

export function defaultMessageBodyWrapper({ body, releaseLink, releaseName, packagesStats }: {
  body: string,
  releaseLink: string | null,
  releaseName: string,
  packagesStats: PublishedStats
}) {
  let header = releaseLink || releaseName

  if (packagesStats.error.length) {
    let warnSuffix
    if (packagesStats.success.length) {
      warnSuffix = 'partially failed to release'
    } else {
      warnSuffix = 'failed to release'
    }

    let pipelineSuffix
    if (env.CI_PIPELINE_URL) {
      pipelineSuffix = `([pipeline](${env.CI_PIPELINE_URL}))`
    }

    header = `:warning: ${releaseName} ${warnSuffix}${pipelineSuffix ? ` ${pipelineSuffix}` : ''}`
  } else if (!releaseLink) {
    header += ' has been released'
  }

  return body ? `${header}\n${body}` : header
}

export function releaseMessage(releaseProps: ReleasedProps, opts: MessageBuilderOpts = {}): Message {
  const { pvmConfig, packagesStats } = releaseProps
  const { attachPackages = isGenericTagUsed(pvmConfig) } = opts

  return buildMessage(releaseProps, {
    bodyWrapper: (body, { releaseLink, releaseName }) => {
      return defaultMessageBodyWrapper({
        body,
        releaseLink,
        releaseName,
        packagesStats,
      })
    },
    attachPackages,
  })
}
