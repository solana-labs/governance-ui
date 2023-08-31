// eslint-rules/no-banned-methods.js
module.exports = {
  create(context) {
    const parserServices = context.parserServices
    const typeChecker = parserServices.program.getTypeChecker()

    if (parserServices === undefined) return {}

    return {
      MemberExpression(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node)
        const fungus = parserServices.esTreeNodeToTSNodeMap.get(node.property)
        const expression = tsNode.expression
        const type = typeChecker.typeToString(
          typeChecker.getTypeAtLocation(tsNode)
        )
        const etype = typeChecker.typeToString(
          typeChecker.getTypeAtLocation(expression)
        )

        if (
          node.property.type === 'Identifier' &&
          node.property.name === 'toNumber' &&
          (etype === 'BN' || etype === 'BigNumber' || etype === 'any')
        ) {
          context.report({
            node,
            message: `you should probably not be casting a big number to a JS native number. this is a common source of latent bugs due to integer overflow`,
          })
        }
      },
    }
  },
}
