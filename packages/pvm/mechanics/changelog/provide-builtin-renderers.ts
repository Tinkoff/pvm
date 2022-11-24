import { getHostApi } from "../../lib/plugins"
import ListRenderer from './md/list'
import ListWithPackagesRenderer from './md/list-with-packages'

async function provideBuiltinRenderers(cwd: string): Promise<void> {
  const hostApi = await getHostApi(cwd)

  hostApi.provides('changelog.builtin.list', ListRenderer)
  hostApi.provides('changelog.builtin.list-with-packages', ListWithPackagesRenderer)
}

export default provideBuiltinRenderers
