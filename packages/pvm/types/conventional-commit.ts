type CCField = string | null;

interface CCNote {
  title: string,
  text: string,
}

interface CCReference {
  issue: string,

  /**
   * @default
   * null
   */
  action: CCField,

  /**
   * @default
   * null
   */
  owner: CCField,

  /**
   * @default
   * null
   */
  repository: CCField,

  prefix: string,
  raw: string,
}

interface CCRevert {
  hash?: CCField | undefined,
  header?: CCField | undefined,
  [field: string]: CCField | undefined,
}

interface BaseConventionalCommit {
  /**
   * @default
   * null
   */
  merge: CCField,

  /**
   * @default
   * null
   */
  header: CCField,

  /**
   * @default
   * null
   */
  body: CCField,

  /**
   * @default
   * null
   */
  footer: CCField,

  /**
   * @default
   * []
   */
  notes: CCNote[],

  /**
   * @default
   * []
   */
  references: CCReference[],

  /**
   * @default
   * []
   */
  mentions: string[],

  /**
   * @default
   * null
   */
  revert: CCRevert | null,

  type?: CCField | undefined,
  scope?: CCField | undefined,
  subject?: CCField | undefined,
}

export type ConventionalCommit<Fields extends string | number | symbol = string | number | symbol> = BaseConventionalCommit & { [Field in Exclude<Fields, keyof BaseConventionalCommit>]?: CCField };
