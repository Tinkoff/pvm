import { parseCodeOwners, CodeOwners } from '../cowners'

describe('pvm/cowners', () => {
  it('should handle paths with spaces', () => {
    const entries = parseCodeOwners('path\\ with\\ spaces/ @space-owner')
    expect(entries[0].pattern).toEqual('path\\ with\\ spaces/')
    expect(entries[0].owners).toEqual([
      '@space-owner',
    ])
  })

  it('should handle paths \\# sequences', () => {
    const entry = parseCodeOwners('\\#foo @foo-owner')[0]
    expect(entry.match('#foo')).toEqual(true)
  })

  it('should skip invalid owners', () => {
    const entries = parseCodeOwners('LICENSE @legal this_does_not_match janedoe@gitlab.com')
    expect(entries[0].pattern).toEqual('LICENSE')
    expect(entries[0].owners).toEqual([
      '@legal',
      'janedoe@gitlab.com',
    ])
  })

  it('should parse hashbang attributes', () => {
    const owners = new CodeOwners(`
      # just comment
      #! int=4 str=just_string quoted_str='cat\\'s ball' new=false old=true greet="hello world!" vs=null ws = allowed
      #! after_newline=0x42
      # licence owners
      LICENSE @owners
    `)

    const firstGroup = owners.getGroups()[0]
    expect(firstGroup.attrs).toEqual({
      after_newline: 0x42,
      int: 4,
      str: 'just_string',
      quoted_str: `cat's ball`,
      new: false,
      old: true,
      greet: 'hello world!',
      vs: null,
      ws: 'allowed',
    })
  })

  it('should follow rule: the last matching pattern takes the most precedence', () => {
    const owners = new CodeOwners(`
      * @maintainers
      *.js @js-owners
    `)

    expect(owners.getOwners(['foo/bar.js', 'test.js'])).toEqual([
      '@js-owners',
    ])
  })

  it('should group owners by pattern', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @egor
      /baz @albert @boris @vinokur
    `)

    expect(owners.groupOwnersByPattern(['bar/foo', 'baz/README'])).toEqual({
      '/bar': ['@lev', '@elistrat', '@egor'],
      '/baz': ['@albert', '@boris', '@vinokur'],
    })
  })

  it('should calc majority for review', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @albert
      /baz @albert @boris @vinokur
    `)

    expect(owners.getMajority(['bar/foo', 'baz/README']).sort()).toEqual([
      '@albert',
      '@boris',
      '@lev',
    ])
  })

  it('should calc majority for review, initial reviewers defined', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @albert
      /baz @albert @boris @vinokur
    `)

    expect(
      owners.getMajority(['bar/foo', 'baz/README'], {
        initial: ['@boris', '@vinokur'],
      }).sort()
    ).toEqual(
      [
        '@boris',
        '@elistrat',
        '@lev',
        '@vinokur',
      ]
    )
  })

  it('should calc majority with initial reviewers and minimal approvals configured', () => {
    const owners = new CodeOwners(`
      * @maintainers
      #! min_approvals=2
      /bar @lev @elistrat @albert @boris @vinokur @gleb @olga @svetlana
      /baz @igor @kopernik
    `)

    expect(
      owners.getMajority(['bar/foo', 'baz/README'], {
        initial: ['@albert', '@boris', '@vinokur', '@gleb', '@olga', '@svetlana'],
      }).sort()
    ).toEqual(
      [
        '@albert',
        '@boris',
        '@igor',
      ]
    )
  })

  it('majority for group of 2 members, where initial is last from group', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @albert
      /baz @boris @vinokur
    `)

    expect(
      owners.getMajority(['bar/foo', 'baz/README'], {
        initial: ['@vinokur'],
      }).sort()
    ).toEqual(
      [
        '@elistrat',
        '@lev',
        '@vinokur',
      ]
    )
  })

  it('should exclude person from majorify if needed', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @albert
      /baz @albert @boris @vinokur
    `)

    expect(
      owners.getMajority(['bar/foo', 'baz/README'], {
        initial: ['@boris', '@vinokur'],
        exclude: ['@boris'],
      }).sort()
    ).toEqual(
      [
        '@albert',
        '@lev',
        '@vinokur',
      ]
    )
  })

  it('should exclude person from majorify if needed, case 2', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @albert
      /baz @albert @boris @vinokur
    `)

    expect(
      owners.getMajority(['bar/foo', 'baz/README'], {
        exclude: ['@albert'],
      }).sort()
    ).toEqual(
      [
        '@boris',
        '@elistrat',
        '@lev',
        '@vinokur',
      ]
    )
  })

  it('should calc majority for review, with maintainers case', () => {
    const owners = new CodeOwners(`
      * @maintainers
      /bar @lev @elistrat @albert
      /baz @albert @boris @vinokur
    `)

    expect(owners.getMajority(['bar/foo', 'baz/README', 'sv'])).toEqual([
      '@albert',
      '@boris',
      '@lev',
      '@maintainers',
    ])
  })
})
