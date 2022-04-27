const { execSync } = require('child_process')

const CLI_INLINE_REGEXP = /\s*@cli-inline\s+(.*)$/
const CLI_INLINE_MARKDOWN_REGEXP = /\s*@cli-inline-md\s+(.*)$/

module.exports = ({ cwd = '' } = {}) => {
  return async (tree, file) => {
    const promises = []
    const currentCwd = cwd

    const { visit } = await import('unist-util-visit')
    const { fromMarkdown } = await import('mdast-util-from-markdown')
    visit(tree, (node) => node.type === 'text' || node.type === 'code', (node) => {
      const match = CLI_INLINE_REGEXP.exec(node.value)
      const matchMd = CLI_INLINE_MARKDOWN_REGEXP.exec(node.value)
      const commonMatch = match ?? matchMd

      if (commonMatch) {
        try {
          const result = execSync(commonMatch[1], {
            encoding: 'utf-8',
            cwd: currentCwd,
          })
          if (match) {
            node.value = result
          } else {
            const mdast = fromMarkdown(result)
            node.type = 'paragraph'
            node.children = mdast.children
          }
        } catch (error) {
          console.error(`Error in cli-inline plugin, file ${file.history[0]}`, error.message)
          throw error
        }
      }
    })

    await Promise.all(promises)

    return tree
  }
}
/* eslint-enable no-param-reassign */
