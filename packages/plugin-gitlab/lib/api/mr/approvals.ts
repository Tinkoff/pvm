import glapi from '../index'
import type { UriSlug } from '../api-helpers'
import { encodeSlug } from '../api-helpers'
import type { Group, PublicPerson } from '../../../types/api/people'
import type { HttpResponseSuccess, Container } from '@pvm/pvm'
import pMap from 'p-map'
import { logger } from '@pvm/pvm'

interface UserWrapper {
  user: PublicPerson,
}

interface GroupWrapper {
  group: Group,
}

export interface ProjectApprovals {
  approvers: UserWrapper[],
  approver_groups: GroupWrapper[],
  approvals_before_merge: number,
  reset_approvals_on_push: boolean,
  disable_overriding_approvers_per_merge_request: boolean,
  merge_requests_author_approval: boolean,
}

async function projectApprovals(di: Container, projectId: UriSlug): Promise<ProjectApprovals> {
  const { json } = await glapi(di, `/projects/${encodeSlug(projectId)}/approvals`)
  return json
}

export interface MergeRequestApprovals {
  id: number,
  iid: number,
  title: string,
  description: string,
  state: string,
  created_at: string,
  updated_at: string,
  merge_status: string,
  approvals_required: number,
  approvals_left: number,
  approved_by: UserWrapper[],
  approvers: UserWrapper[],
  approver_groups: GroupWrapper[],
}

async function mergeRequestApprovals(di: Container, projectId: UriSlug, mrIid: number): Promise<MergeRequestApprovals> {
  const { json } = await glapi(di, `/projects/${encodeSlug(projectId)}/merge_requests/${mrIid}/approvals`)
  return json
}

// feature not stable, see https://gitlab.com/gitlab-org/gitlab-ee/issues/12055
// @TODO: Deprecated in 12.0 in favor of Approval Rules API.
async function setApprovalsRequired(di: Container, projectId: UriSlug, iid: number, count: number): Promise<HttpResponseSuccess<MergeRequestApprovals>> {
  // https://docs.gitlab.com/ee/api/merge_request_approvals.html#change-approval-configuration
  return glapi<MergeRequestApprovals>(di, `/projects/${encodeSlug(projectId)}/merge_requests/${iid}/approvals`, {
    method: 'POST',
    body: {
      approvals_required: count,
    },
  })
}

async function setApprovers(di: Container, projectId: UriSlug, iid: number, approvers: string[]): Promise<HttpResponseSuccess> {
  let approver_ids = await pMap(approvers, async username => {
    const { json: list } = await glapi(di, `/users?username=${encodeURIComponent(username)}`)
    if (list.length === 1) {
      return list[0].id
    } else if (list.length === 0) {
      logger.error(`user ${username} not found`)
    } else {
      logger.error(`multiple users for ${username}`)
    }
  }, {
    concurrency: 3,
  })

  approver_ids = approver_ids.filter(x => x !== void 0)

  // for some reason gitlab api buggy here – sometimes update to non-empty list do nothing
  // so we do request to do a empty approvers first
  // @TODO: This API endpoint has been deprecated. Please use Approval Rule API instead. Introduced in GitLab Starter 10.6.
  // https://docs.gitlab.com/ee/api/merge_request_approvals.html#change-allowed-approvers-for-merge-request
  await glapi(di, `/projects/${encodeSlug(projectId)}/merge_requests/${iid}/approvers`, {
    method: 'PUT',
    body: {
      approver_ids: [],
      approver_group_ids: [],
    },
  })

  return glapi(di, `/projects/${encodeSlug(projectId)}/merge_requests/${iid}/approvers`, {
    method: 'PUT',
    body: {
      approver_ids,
      approver_group_ids: [],
    },
  })
}

function ownersWithoutDogs(owners: string[]): string[] {
  return owners.reduce((withoutDogs: string[], owner: string): string[] => {
    if (owner.startsWith('@')) {
      withoutDogs.push(owner.substr(1))
    } else {
      logger.error(`assign approvers by emails not supported for gitlab! Email ${owner} will be ignored`)
    }

    return withoutDogs
  }, [])
}

export {
  projectApprovals,
  mergeRequestApprovals,
  setApprovalsRequired,
  setApprovers,
  ownersWithoutDogs,
}
