
export interface Person {
  id: number,
  username: string,
  email: string,
  name: string,
  state: string,
  created_at: string,
}

export interface PublicPerson {
  id: number,
  name: string,
  username: string,
  state: 'active' | 'blocked',
  avatar_url: string | null,
  web_url: string,
}

export interface PublicMember extends PublicPerson {
  access_level: number,
  expires_at: string | null,
}

export interface Group {
  id: number,
  name: string,
  path: string,
  description: string,
  visibility: string,
  lfs_enabled: boolean,
  avatar_url: string | null,
  web_url: string,
  full_name: string,
  full_path: string,
  parent_id: number | null,
  ldap_cn: string | null,
  ldap_access: string | null,
}
