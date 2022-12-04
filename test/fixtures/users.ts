
export type User = {
  id: number,
  username: string,
  name: string,
}

export const users: User[] = [
  {
    id: 1,
    username: 'default',
    name: 'Default',
  },
  {
    id: 2,
    username: 'petr',
    name: 'Petr Kapitsa',
  },
  {
    id: 3,
    username: 'boris',
    name: 'Boris Godunov',
  },
  {
    id: 4,
    username: 'lev',
    name: 'Lev Tolstoy',
  },
  {
    id: 5,
    username: 'konstantin',
    name: 'Konstantin Tsiolkovsky',
  },
  {
    id: 6,
    username: 'albert',
    name: 'Albert Einstein',
  },
  {
    id: 7,
    username: 'vinokur',
    name: 'Vinokur',
  },
  {
    id: 8,
    username: 'elistrat',
    name: 'Elistrat',
  },
  {
    id: 9,
    username: 'daniel',
    name: 'Daniel Poperechny',
  },
  {
    id: 10,
    username: 'nikolay',
    name: 'nikolay',
  },
]

export function mapUsers(ids: number[], wrap: true): Array<{ user: User }>
export function mapUsers(ids: number[], wrap?: false): Array<User>
export function mapUsers(ids: number[], wrap = true): Array<{ user: User } | User> {
  return ids.reduce((acc, id) => {
    const user = users.find(u => u.id === id)
    if (user) {
      acc.push(wrap ? { user } : user)
    }
    return acc
  }, [] as Array<User | { user: User }>)
}

export function getUser(username: string) {
  return users.find(u => u.username === username)
}
