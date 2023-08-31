module.exports = {
  create(context) {
    return {
      Identifier(node) {
        if (node.name.toLowerCase() === 'pizza') {
          return context.report({
            node,
            message: 'Nope, the variable name "pizza" is reserved',
          })
        }
        return null
      },
    }
  },
}
