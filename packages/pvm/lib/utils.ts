import chalk from 'chalk'

import type { Pkg as PkgType } from './pkg'
import type { SignaleType } from 'signales'
import { env } from './env'
import { logger } from './logger'
import { inspectArgs } from './inspect-args'

export function isFlatArraysEqual<T>(left: T[], right: T[]): boolean {
  if (left.length !== right.length) {
    return false
  }
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) {
      return false
    }
  }
  return true
}

enum CompType {
  Primitive,
  Array,
  Object,
}

function getCompType(x: unknown): CompType {
  if (x === null || typeof x !== 'object') {
    return CompType.Primitive
  } else if (Array.isArray(x)) {
    return CompType.Array
  }
  return CompType.Object
}

export function isRecordsDeepEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  const rightKeys = new Set(Object.keys(left))
  const leftEntries = Object.entries(left)
  if (rightKeys.size !== leftEntries.length) {
    return false
  }
  for (const [key, value] of Object.entries(left)) {
    rightKeys.delete(key)
    if (!isDeepEqual(right[key], value)) {
      return false
    }
  }
  return !rightKeys.size
}

export function isDeepEqual(l: unknown, r: unknown): boolean {
  const lType = getCompType(l)
  const rType = getCompType(r)
  if (lType !== rType) {
    return false
  }
  if (lType === CompType.Primitive) {
    if (l !== r) {
      return false
    }
  } else if (lType === CompType.Array) {
    if (!isArraysDeepEqual(l as unknown[], r as unknown[])) {
      return false
    }
  } else {
    if (!isRecordsDeepEqual(l as Record<string, unknown>, r as Record<string, unknown>)) {
      return false
    }
  }
  return true
}

export function isArraysDeepEqual(left: unknown[], right: unknown[]): boolean {
  if (left.length !== right.length) {
    return false
  }
  for (let i = 0; i < left.length; i++) {
    if (!isDeepEqual(left[i], right[i])) {
      return false
    }
  }
  return true
}

export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && !Array.isArray(x) && typeof x === 'object'
}

export function handleDifferentComparisonRefs(logger: SignaleType, storedPkg: PkgType, providedPkg: PkgType): void {
  if (env.PVM_TESTING_ENV) {
    throw new Error(`Found pkg ${providedPkg.name} with same name but different reference. Search by name instead, or refactor pkg obtain code.`)
  }
  logger.error(chalk`Incorrect comparison of two packages with same name {blue ${storedPkg.name}} but constructed from different refs {yellow ${storedPkg.ref}} and {yellow ${providedPkg.ref}}`)
}

export function logDryRun(_target: { dryRun: boolean }, propName: string, descriptor: TypedPropertyDescriptor<any>): void {
  const method = descriptor.value!
  descriptor.value = function(...args) {
    if (this.dryRun) {
      logger.debug(`DRY RUN: ${propName}`, `(${inspectArgs(args)})`)
    }

    return method.call(this, ...args)
  }
}
