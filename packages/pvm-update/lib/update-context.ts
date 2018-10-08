import type { Repository } from '@pvm/repository/lib'
import type { HintsContext } from '@pvm/repository/lib/repository'

// сейчас то же что и HintsContext но возможно расширится в будущем
export type UpdateContext = HintsContext

async function updateContext(repo: Repository): Promise<UpdateContext> {
  return repo.hintsContext()
}

export default updateContext
