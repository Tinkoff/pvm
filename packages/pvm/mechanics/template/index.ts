import { mema } from "../../lib/memoize"
import getTemplateEnv from './env'
import { compile } from 'nunjucks'

export const lazyCompileTemplate = mema(async (text: string) => {
  const templateEnv = await getTemplateEnv()
  return compile(text, templateEnv)
})
