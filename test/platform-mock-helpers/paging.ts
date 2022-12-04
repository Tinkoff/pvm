
const { get } = require('sprout-data')

export function paginate(list: any[], pagingQuery: { page: number, per_page: number, order_by: string, sort?: string}, opts: {
  sortMap?: Record<string, string | string[]>,
  cmp?: (a: any, b: any) => number,
  toComparable?: (a: any) => any
} = {}) {
  const { page, per_page, order_by, sort = 'desc' } = pagingQuery

  const defaultComparator = (a: any, b: any) => {
    return sort === 'asc' ? a - b : b - a
  }

  const { sortMap = {}, cmp = defaultComparator, toComparable = a => a } = opts

  let realSortKey = sortMap[order_by] || order_by
  if (!realSortKey) {
    realSortKey = sortMap.updated || 'updated'
  }

  list = [...list]

  list.sort((a, b) => {
    const aVal = get(a, realSortKey)
    const bVal = get(b, realSortKey)

    if (aVal === void 0 || bVal === void 0) {
      throw new Error('undefined values for comparing, check your sortMap and other sort options')
    }

    return cmp(toComparable(aVal), toComparable(bVal))
  })

  const start = (page - 1) * per_page
  const end = start + per_page

  return [
    list.slice(start, end),
    {
      'X-Total': list.length,
      'X-Total-Pages': Math.ceil(list.length / per_page),
    },
  ]
}

export function pagingQuery(query: Record<string, any>, order_by_def = 'updated') {
  const { sort = 'desc', order_by = order_by_def } = query
  const page = Number(query.page || 1)
  const per_page = Number(query.per_page || 20)

  return {
    page,
    per_page,
    order_by,
    sort,
  }
}
