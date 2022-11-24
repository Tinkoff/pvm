import { bootstrap } from 'global-agent'

async function plugin(_api): Promise<void> {
  bootstrap({
    environmentVariableNamespace: '',
  })
}

export default plugin
