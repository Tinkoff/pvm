import nunjucks from 'nunjucks'
import requireSetupScript from './require-setup-script'
import { pullOutLinks, dottifyList } from '../../lib/text/markdown'
import { issueToLink, issueToMdLink } from '../../lib/text/jira'
import { stripServiceLabels } from '../../lib/text/commits'
import { stripPkgNamespace } from '../../lib/tag-meta'
import type { Config } from '../../types'
import type { Pkg } from '../../lib/pkg'

let env: nunjucks.Environment & {
  setVar?: (name: string, value: any) => void,
  getVar?: (name: string) => any,
}

async function getEnv(config: Config): Promise<nunjucks.Environment> {
  if (!env) {
    const ConfigLoader = class {
      public getSource(name: string) {
        return {
          src: config.templates[name],
          path: `/config/templates/${name}`,
          noCache: true,
        }
      }
    }

    env = new nunjucks.Environment([
      new nunjucks.FileSystemLoader('.pvm.d/templates'),
      new ConfigLoader(),
    ])
    const templatingConfig = config.templating
    const filtersConfig = templatingConfig.filters

    env.addGlobal('config', config)
    env.addGlobal('vars', config.templating.vars)

    env.setVar = (name, value) => {
      config.templating.vars[name] = value
    }
    env.getVar = name => {
      return config.templating.vars[name]
    }

    env.addFilter('shorten', (str, maxLen = 60) => {
      if (str.length > maxLen) {
        str = str.substr(0, maxLen) + '..'
      }
      return str
    })
    let cutMessage = void 0

    env.addGlobal('showPkg', (pkg: Pkg) => {
      const name = templatingConfig.use_short_names ? pkg.shortName : pkg.name

      return `**${name}@${pkg.version}**`
    })

    env.addFilter('cutList', (list, message, maxLen = filtersConfig.cutList.maxLen) => {
      if (list.length < maxLen) {
        return list
      }

      cutMessage = message.replace('{restLen}', list.length - maxLen + 1)

      return list.slice(0, maxLen - 1)
    })

    env.addFilter('putCutMessage', list => {
      let result = list

      if (cutMessage) {
        result = list.concat(cutMessage)
        cutMessage = void 0
      }

      return result
    })

    env.addFilter('enpl', (listOrNumber, zero, one, many) => {
      const count = typeof listOrNumber === 'number' ? listOrNumber : listOrNumber.length

      if (count === 0) {
        return zero
      } else if (count === 1) {
        return one
      } else {
        return many
      }
    })

    env.addFilter('joinAnd', (list, joiner = ', ') => {
      if (list.length < 3) {
        return list.join(joiner)
      }
      const withoutLast = list.slice(0, list.length - 1)
      const last = list[list.length - 1]

      return `${withoutLast.join(joiner)} and ${last}`
    })
    env.addFilter('items', (list, id) => {
      return list.map((item: any) => item[id])
    })
    env.addFilter('toArray', arr => {
      return Array.from(arr)
    })
    env.addFilter('ul', (list, symbol = '•') => {
      return list.map((item: string) => `${symbol} ${item}`).join('\n')
    })
    env.addFilter('wrap', (t, wrap) => {
      if (Array.isArray(t)) {
        return t.map(item => wrap + item + wrap)
      }
      return wrap + t + wrap
    })
    env.addFilter('map', (list, fn) => {
      return list.map(fn)
    })
    env.addFilter('dottifyList', dottifyList)
    env.addFilter('pullOutLinks', pullOutLinks)
    env.addFilter('jiraLinkify', (text: string) => config.jira.url ? issueToLink(config.jira.url, text) : text)
    env.addFilter('jiraLinkifyMd', (text: string) => config.jira.url ? issueToMdLink(config.jira.url, text) : text)
    env.addFilter('stripServiceLabels', stripServiceLabels)
    env.addFilter('stripPkgNamespace', stripPkgNamespace)

    const { setup_script } = templatingConfig

    if (setup_script) {
      const setupFn = requireSetupScript(setup_script)
      await setupFn(env)
    }
  }

  return env
}

export default getEnv
