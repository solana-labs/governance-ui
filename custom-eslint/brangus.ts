import { ESLintUtils } from '@typescript-eslint/utils'

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
)

// Type: RuleModule<"uppercase", ...>
export const rule = createRule({
  create(context) {
    const parserServices = context.parserServices
    if (parserServices) {
      const typeChecker = parserServices.program.getTypeChecker()
      return {
        MemberExpression(node) {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.object)
          const objectIdentifier = tsNode.expression
          const type = typeChecker.getTypeAtLocation(tsNode)
          const b =
            objectIdentifier &&
            typeChecker.getTypeAtLocation(objectIdentifier).symbol

          const x = typeChecker.typeToString(tsNode)

          if (
            node.property.type === 'Identifier' &&
            node.property.name === 'toNumber' &&
            type
          ) {
            context.report({
              node,
              message:
                "Don't use bannedMethod from BannedClass." +
                JSON.stringify(tsNode),
            })
          }
        },
      }
    }
  },
  name: 'uppercase-first-declarations',
  meta: {
    docs: {
      description:
        'Function declaration names should start with an upper-case letter.',
      recommended: 'warn',
    },
    messages: {
      no: 'Start this name with an upper-case letter.',
    },
    type: 'suggestion',
    schema: [],
  },
  defaultOptions: [],
})
