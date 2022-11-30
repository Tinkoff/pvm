import gitlabEnv from '../env'
import glapi from '../api'
import type { MergeRequest } from '../api/mr/types'
import type { Container } from '@pvm/pvm'

async function findOpenSingleMr(di: Container, branchName: string | undefined = gitlabEnv.getBranchName()): Promise<MergeRequest> {
  if (!branchName) {
    throw new Error(`Couldn't find open single merge request without branch name`)
  }
  const { json: mrs } = await glapi<Array<MergeRequest>>(di, `/projects/${gitlabEnv.projectSlug}/merge_requests?source_branch=${branchName}&state=opened&per_page=2`)

  if (!mrs || mrs.length === 0) {
    throw new Error(`There is no merge request for branch ${branchName}`)
  } else if (mrs.length === 1) {
    return mrs[0]
  }
  throw new Error(`There are ${mrs.length} merge requests opened for branch ${branchName}. Expected one.`)
}

async function findMergedLastMr(di: Container, branchName: string | undefined = gitlabEnv.getBranchName()): Promise<MergeRequest> {
  if (!branchName) {
    throw new Error(`Couldn't find open single merge request without branch name`)
  }
  const { json: mrs } = await glapi<Array<MergeRequest>>(di, `/projects/${gitlabEnv.projectSlug}/merge_requests?source_branch=${branchName}&state=merged&per_page=1&order_by=updated_at`)

  if (!mrs || mrs.length === 0) {
    throw new Error(`There is no merged merge request for branch ${branchName}`)
  }

  return mrs[0]
}

export {
  findOpenSingleMr,
  findMergedLastMr,
}
