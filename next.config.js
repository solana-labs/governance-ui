// workaround for ESM module loader errors
// see https://github.com/vercel/next.js/issues/25454
const withTM = require('next-transpile-modules')(['react-markdown'])

module.exports = withTM({
  target: 'serverless',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    config.node = {
      fs: 'empty',
    }

    return config
  },
  webpack5: false,
  env: {
    REALM: process.env.REALM,
  },
})
