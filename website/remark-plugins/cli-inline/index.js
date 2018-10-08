const { execSync } = require('child_process')

const CLI_INLINE_REGEXP = /\s*@cli-inline\s+(.*)$/

const replaceNode = async (node, text) => {
  node.type = 'code'
  node.value = text
}

module.exports = ({ cwd = '' } = {}) => {
  return async (tree, file) => {
    const promises = []
    const currentCwd = cwd

    const { visit } = await import('unist-util-visit')
    visit(tree, 'text', (node) => {
      const match = CLI_INLINE_REGEXP.exec(node.value)

      if (match) {
        try {
          replaceNode(node, execSync(match[1], {
            encoding: 'utf-8',
            cwd: currentCwd,
          }))
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
