
import type { Person } from './people'

export interface MrNote {
  id: number,
  body: string,
  attachment: null,
  author: Person,
  created_at: string,
  updated_at: string,
  system: boolean,
  noteable_id: number,
  noteable_type: 'MergeRequest',
  noteable_iid: number,
  resolvable: boolean,
}
