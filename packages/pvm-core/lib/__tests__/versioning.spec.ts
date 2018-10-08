
import { extractVersionsFromAnnotation } from '../versioning'

function extractVersionsHelper(annotation: string): Record<string, string> {
  return Object.fromEntries(extractVersionsFromAnnotation(annotation).entries())
}

describe('core/versioning', () => {
  describe('tag-annotation', () => {
    it('should extract versions from footer', () => {
      const result = extractVersionsHelper('release desc\n\n---\ncore@1.0.0\nabc@2.1.4\n')
      expect(result).toEqual({
        core: '1.0.0',
        abc: '2.1.4',
      })
    })

    it('should take versions from footer only', () => {
      const result = extractVersionsHelper('---\nab@2.0.0\n---\n\nrelease desc\n\n---\ncore@1.0.0\nabc@2.1.4\n')
      expect(result).toEqual({
        core: '1.0.0',
        abc: '2.1.4',
      })
    })

    it('should support carriage return symbol', () => {
      const result = extractVersionsHelper('---\r\nab@2.0.0\r\n---\r\n\r\nrelease desc\r\n\r\n---\r\ncore@1.0.0\r\nabc@2.1.4\r\n')
      expect(result).toEqual({
        core: '1.0.0',
        abc: '2.1.4',
      })
    })

    it('CR edge case 1', () => {
      const result = extractVersionsHelper('release desc\r\n\r\n---\r\nabc---def@1.2.3')
      expect(result).toEqual({
        'abc---def': '1.2.3',
      })
    })

    it('should extract versions from namespaced packages', () => {
      const result = extractVersionsHelper('release desc\n\n---\n@tinkoff/core@1.0.0\n@tinkoff/abc@2.1.4\n')
      expect(result).toEqual({
        '@tinkoff/core': '1.0.0',
        '@tinkoff/abc': '2.1.4',
      })
    })

    it('should work property without line break at the end of annotation', () => {
      const result = extractVersionsHelper('release desc\n\n---\n@tinkoff/core@1.0.0\n@tinkoff/abc@2.1.4')
      expect(result).toEqual({
        '@tinkoff/core': '1.0.0',
        '@tinkoff/abc': '2.1.4',
      })
    })

    it('if no tag specified should return empty record', () => {
      expect(extractVersionsHelper('')).toEqual({})
    })
  })
})
