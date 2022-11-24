import { mema } from '../../lib/memoize'
import getTemplateEnv from './env'
import { compile } from 'nunjucks'
import type { Container } from '../../lib/di'

export const lazyCompileTemplate = mema(async (di: Container, text: string) => {
  const templateEnv = await getTemplateEnv(di)
  return compile(text, templateEnv)
})
