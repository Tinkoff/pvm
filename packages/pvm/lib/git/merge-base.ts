import { wdShell } from '../shell'
import { env } from '../env'

export function mergeBase(cwd: string, from: string, to: string): string {
  try {
    return wdShell(cwd, `git merge-base ${from} ${to}`)
  } catch (e) {
    const message = [e.message]
    let gitDepthDesc = '.'
    if (env.GIT_DEPTH) {
      gitDepthDesc = ` to ${env.GIT_DEPTH} commits.`
    }
    message.push(`Looks like you have a shallow cloned repository with a truncated history${gitDepthDesc}`)
    message.push(`Try to ${env.GIT_DEPTH ? 'increase' : 'set'} the value of variable GIT_DEPTH to some significant value.`)

    throw new Error(message.join('\n'))
  }
}
