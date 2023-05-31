import * as release from './release'
import * as dot from './dot'
import * as print from './print'
import * as mdTable from './md-table'
import type { UpdateMethod } from '../types/index'

export const updateMethods: Record<string, UpdateMethod<any>> = {
  release,
  dot,
  print,
  mdTable,
}
