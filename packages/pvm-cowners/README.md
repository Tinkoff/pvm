# @pvm/cowners

A library for working with CODEOWNERS file.

## Usage

```js
const { readCodeOwners } = require('@pvm/cowners')

async function main() {
  const codeOwners = await readCodeOwners()
}
```

## Interfaces

### `OwnersEntry`

Structure which holds each valid line with pattern and owners in CODEWNERS file.
Here is typescript definition:

```typescript
interface OwnersGroup {
  attrs: Record<string, string | number | boolean | null>,
  pattern: string,
  owners: string[],
  match(path: string): boolean,
}
```

Where `attrs` are being parsed from shebang comments.
Example shebang comment with all available cases:

```
#! int=4 str='cat\'s ball' new=false old=true greet="hello world!" vs=null
* @owners
```

## Api

### `getGroups(): OwnersGroup[]`

Returns all OwnersGroups which has been parsed.

### `affectedGroups(paths: string[]): IterableIterator<OwnersGroup>`

Returns OwnersGroups which related to given paths.

#### `getOwners(paths: string[]): string[]`

Get all owners for given paths.

#### `getMajority(paths: string[], opts: GetMajorityOpts = {}): string[]`

Get majority of owners required for review merge request.
For each mask majority is `Math.ceil(owners_for_mask / 2)`.

##### `GetMajorityOpts.initial`

List if initial reviewers.

##### `GetMajorityOpts.exclude`

List of reviewers which should be excluded from result.

### `groupOwnersByMask(paths: string[]): Record<string, string[]>`

Get all owners for given paths and group by filename patterns.
