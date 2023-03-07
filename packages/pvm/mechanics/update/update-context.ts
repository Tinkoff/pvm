import type { Repository } from '../repository'
import type { HintsContext } from '../repository/repository'

// сейчас то же что и HintsContext но возможно расширится в будущем
export type UpdateContext = HintsContext

async function updateContext(repo: Repository): Promise<UpdateContext> {
  return repo.hintsContext()
}

export default updateContext
