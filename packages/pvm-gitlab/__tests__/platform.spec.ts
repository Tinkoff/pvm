import { GitlabPlatform } from '../lib/platform'

describe('@pvm/gitlab', () => {
  describe('GitlabPlatform.getPvmUpdateHintsFromString', () => {
    it('should parse valid markdown with pvm toml', () => {
      const res = GitlabPlatform.getPvmUpdateHintsFromString(`Closes PFPBLOCKS-5004

\`\`\`toml
kind = 'pvm-update-hints'

[release-types]
major = [
  '@pvm/plugin-*',
  'test-a',
]
\`\`\``)

      expect(res).toMatchObject({
        'release-types': {
          major: [
            '@pvm/plugin-*',
            'test-a',
          ],
        },
      })
    })

    it('should not fail if toml invalid', () => {
      const res = GitlabPlatform.getPvmUpdateHintsFromString(`Closes PFPBLOCKS-5004

\`\`\`toml
!??!
\`\`\``)

      expect(res).toBeNull()
    })

    it('should not fail if no toml code blocks found', () => {
      const res = GitlabPlatform.getPvmUpdateHintsFromString(`Closes PFPBLOCKS-5004`)

      expect(res).toBeNull()
    })

    it('should take first code block', () => {
      const res = GitlabPlatform.getPvmUpdateHintsFromString(`Closes PFPBLOCKS-5004

\`\`\`toml
kind = 'pvm-update-hints'

[release-types]
major = '*'
\`\`\`

\`\`\`toml
kind = 'pvm-update-hints'

[release-types]
minor = '*'
\`\`\`
`)

      expect(res).toMatchObject({
        'release-types': {
          major: '*',
        },
      })
    })

    it('should not take code block without kind = "pvm-update-hints"', () => {
      const res = GitlabPlatform.getPvmUpdateHintsFromString(`Closes PFPBLOCKS-5004

\`\`\`toml
[release-types]
major = [
  '@pvm/plugin-*',
  'test-a',
]
\`\`\``)

      expect(res).toBeNull()
    })
  })
})
