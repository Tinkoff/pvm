module.exports = {
  rules: {
    'no-process-env': {
      meta: {
        type: 'problem',
        messages: {
          avoidProcessEnv: 'Avoid using process.env directly. Use env from @pvm/core/lib/env.ts instead.',
        },
      },
      create(context) {
        return {
          MemberExpression(node) {
            const objectName = node.object.name
            const propertyName = node.property.name

            if (objectName === 'process' && !node.computed && propertyName && propertyName === 'env' && node.parent.type !== 'SpreadElement') {
              context.report({ node, messageId: 'avoidProcessEnv' })
            }
          },
        }
      },
    },
    'no-direct-git-fetch': {
      meta: {
        type: 'problem',
        messages: {
          avoidDirectGitFetch: 'Avoid using `git fetch` directly. Use command from @pvm/core/lib/git/commands instead.',
        },
      },
      create(context) {
        const regex = /^git fetch/

        return {
          Literal(node) {
            if (typeof node.value === 'string' && regex.test(node.value)) {
              context.report({
                node,
                messageId: 'avoidDirectGitFetch',
              })
            }
          },
          TemplateLiteral(node) {
            if (typeof node.quasis.length && regex.test(node.quasis[0].value.raw)) {
              context.report({
                node,
                messageId: 'avoidDirectGitFetch',
              })
            }
          },
        }
      },
    },
    'no-direct-git-tag': {
      meta: {
        type: 'problem',
        messages: {
          avoidDirectGitTag: 'Avoid using `git tag` directly. Use command from @pvm/core/lib/git/commands instead.',
        },
      },
      create(context) {
        const regex = /^git tag/

        return {
          Literal(node) {
            if (typeof node.value === 'string' && regex.test(node.value)) {
              context.report({
                node,
                messageId: 'avoidDirectGitTag',
              })
            }
          },
          TemplateLiteral(node) {
            if (typeof node.quasis.length && regex.test(node.quasis[0].value.raw)) {
              context.report({
                node,
                messageId: 'avoidDirectGitTag',
              })
            }
          },
        }
      },
    },
  },
}
