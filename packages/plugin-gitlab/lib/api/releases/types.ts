
export interface AlterReleaseResult {
  id: string,
}

export interface CreateReleasePayload {
  name: string,
  tag_name: string,
  description: string,
  annotation?: string | null,
}

export interface EditReleasePayload {
  tag_name: string,
  description: string,
}
