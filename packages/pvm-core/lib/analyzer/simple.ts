import type { PvmReleaseType } from '@pvm/types'

const isPatchRe = /^(fix|patch):/i
const isMajorRe = /^BREAKING CHANGE:/

function releaseType(messages: string[], defaultLevel: PvmReleaseType = 'minor'): PvmReleaseType {
  let isPatch = true

  for (const message of messages) {
    if (isMajorRe.test(message)) {
      return 'major'
    }

    if (!isPatchRe.test(message)) {
      isPatch = false
    }
  }

  return isPatch ? 'patch' : defaultLevel
}

export default releaseType
export const tags = [isPatchRe, isMajorRe]
