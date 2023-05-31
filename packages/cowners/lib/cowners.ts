import ignore from 'ignore'
import fs from 'fs'
import locatePath from 'locate-path'
import { reverseIterator, selectWithPassion } from './iter'
import type { ValueType } from './kvpairs'
import { parseKvPairs } from './kvpairs'

export type GroupAttributes = Record<string, ValueType>

export interface OwnersGroup {
  attrs: GroupAttributes,
  pattern: string,
  owners: string[],
  match(path: string): boolean,
}

const codeownersLocs = [
  '.github/CODEOWNERS', '.gitlab/CODEOWNERS', 'docs/CODEOWNERS', 'CODEOWNERS',
]

function isValidOwner(owner: string): boolean {
  return owner.indexOf('@') !== -1
}

function parseHashbangs(comments: string[]): GroupAttributes {
  const result = Object.create(null)
  for (const rawLine of comments) {
    const line = rawLine.replace(/^#!/, '')
    for (const kvPair of parseKvPairs(line)) {
      result[kvPair[0]] = kvPair[1]
    }
  }
  return result
}

function parseOwnersLine(codeOwnerLine: string, hashbangComments: string[] = []): OwnersGroup {
  // requires node 9+
  // https://node.green/#ES2018-features--RegExp-Lookbehind-Assertions
  const [pattern, ...ownerLines] = codeOwnerLine.split(/(?<!\\) /)

  const owners = Array.from(new Set(ownerLines.filter(isValidOwner)))
  const ig = ignore().add(pattern)

  return {
    attrs: parseHashbangs(hashbangComments),
    pattern,
    owners,
    match(pathname: string): boolean {
      return ig.ignores(pathname)
    },
  }
}

function parseCodeOwners(codeOwners: string): OwnersGroup[] {
  const lines = codeOwners.split('\n')
  const entries: OwnersGroup[] = []

  let hashbangComments: string[] = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.startsWith('#!')) {
      hashbangComments.push(line)
    }
    if (!line || line.startsWith('#')) {
      continue
    }

    entries.push(parseOwnersLine(line, hashbangComments))
    hashbangComments = []
  }

  return entries
}

function * ownersIterator(codeOwners: OwnersGroup[], paths: string[]): IterableIterator<OwnersGroup> {
  for (const group of reverseIterator(codeOwners)) {
    const notMatchedPaths = paths.filter(p => !group.match(p))
    const atLeastOneMatched = notMatchedPaths.length < paths.length

    if (atLeastOneMatched) {
      yield group
      // exlude matchedPaths from paths
      paths = notMatchedPaths
    }
    if (paths.length === 0) {
      break
    }
  }
}

function whoCares(codeOwners: OwnersGroup[], paths: string[]): string[] {
  const ownersWhoCares = new Set<string>()

  for (const group of ownersIterator(codeOwners, paths)) {
    for (const owner of group.owners) {
      ownersWhoCares.add(owner)
    }
  }

  return Array.from(ownersWhoCares)
}

function whoCaresByPattern(codeOwners: OwnersGroup[], paths: string[]): Record<string, string[]> {
  const ownersByPattern = Object.create(null)

  for (const group of ownersIterator(codeOwners, paths)) {
    ownersByPattern[group.pattern] = group.owners
  }

  return ownersByPattern
}

function majority(count: number): number {
  return Math.ceil(count / 2)
}

export interface CalcMajorityOpts {
  /** List of initial reviewers */
  initial?: string[],
  /** List of reviewers which should be excluded from result */
  exclude?: string[],
}

function parseIntOr(maybeInt: any, orValue: number): number {
  if (isFinite(Number(maybeInt))) {
    return Number(maybeInt)
  }
  return orValue
}

function majorityWhoCares(codeOwners: OwnersGroup[], paths: string[], opts: CalcMajorityOpts = {}): string[] {
  const { initial: _initial = [], exclude = [] } = opts
  const reviewers = new Set<string>()
  const initial = new Set<string>(_initial)
  for (const person of exclude) {
    if (initial.has(person)) {
      initial.delete(person)
    }
  }

  for (const group of ownersIterator(codeOwners, paths)) {
    const alreadyReviewers = group.owners.filter(owner => reviewers.has(owner))
    const possibleNewReviewers = group.owners.filter(owner => !reviewers.has(owner) && exclude.indexOf(owner) === -1)
    const minApprovals = parseIntOr(group.attrs.min_approvals, majority(group.owners.length))
    // исключаем тех кто уже является ревьюером для данной группы
    const needInclude = minApprovals - alreadyReviewers.length

    if (needInclude > 0) {
      for (const owner of selectWithPassion(possibleNewReviewers, initial, needInclude)) {
        reviewers.add(owner)
      }
    }
  }

  return Array.from(reviewers)
}

class CodeOwners {
  groups: OwnersGroup[]

  constructor(codeOwners: string) {
    this.groups = parseCodeOwners(codeOwners)
  }

  /** Returns all OwnersGroups which has been parsed */
  getGroups(): OwnersGroup[] {
    return this.groups
  }

  /** Returns OwnersGroups which related to given paths */
  affectedGroups(paths: string[]): IterableIterator<OwnersGroup> {
    return ownersIterator(this.groups, paths)
  }

  /** Get all owners for given paths */
  getOwners(paths: string[]): string[] {
    return whoCares(this.groups, paths)
  }

  /**
   * Get majority of owners required for review merge request.
   * For each mask majority is `Math.ceil(owners_for_mask / 2)`
   */
  getMajority(paths: string[], opts: CalcMajorityOpts = {}): string[] {
    return majorityWhoCares(this.groups, paths, opts)
  }

  /** Get all owners for given paths and group by filename patterns */
  groupOwnersByPattern(paths: string[]): Record<string, string[]> {
    return whoCaresByPattern(this.groups, paths)
  }
}

async function readCodeOwners(cwd: string = process.cwd()): Promise<CodeOwners | null> {
  const codeownersFile = await locatePath(codeownersLocs, {
    cwd,
  })

  if (!codeownersFile) {
    return null
  }

  const contents = fs.readFileSync(codeownersFile, {
    encoding: 'utf8',
  })

  return new CodeOwners(contents)
}

export {
  parseOwnersLine,
  readCodeOwners,
  parseCodeOwners,
  CodeOwners,
}
