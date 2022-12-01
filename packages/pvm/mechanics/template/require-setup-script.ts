import resolveFrom from 'resolve-from'
import { requireDefault } from '../../lib/interop'

function resolveScript(setupScript: string) {
  const resolvedSetupScript = resolveFrom(process.cwd(), setupScript)
  const setupFn = requireDefault(resolvedSetupScript)
  if (typeof setupFn !== 'function') {
    throw new Error('setup script should export function')
  }
  return setupFn
}

export default resolveScript
