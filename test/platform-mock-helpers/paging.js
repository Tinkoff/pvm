
const { get } = require('sprout-data')

function paginate(list, pagingQuery, opts = {}) {
  const { page, per_page, order_by, sort = 'desc' } = pagingQuery

  const defaultComparator = (a, b) => {
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

function pagingQuery(query, order_by_def = 'updated') {
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

exports.paginate = paginate
exports.pagingQuery = pagingQuery
