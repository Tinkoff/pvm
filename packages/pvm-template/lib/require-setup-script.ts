import resolveFrom from 'resolve-from'
import { requireDefault } from '@pvm/core/lib'

function resolveScript(setupScript) {
  const resolvedSetupScript = resolveFrom(process.cwd(), setupScript)
  const setupFn = requireDefault(resolvedSetupScript)
  if (typeof setupFn !== 'function') {
    throw new Error('setup script should export function')
  }
  return setupFn
}

export default resolveScript
