import type { PartialDeep } from 'type-fest/source/partial-deep'

type Opts = {
  recurseIntoArrays: false,
}

export type RecursivePartial<T> = PartialDeep<T, Opts>
