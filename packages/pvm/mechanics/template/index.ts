import { mema } from '../../lib/memoize'
import getTemplateEnv from './env'
import { compile } from 'nunjucks'
import type { Config } from '../../types'

export const lazyCompileTemplate = mema(async (config: Config, text: string) => {
  const templateEnv = await getTemplateEnv(config)
  return compile(text, templateEnv)
})
