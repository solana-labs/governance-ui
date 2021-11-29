// workaround for ESM module loader errors
// see https://github.com/vercel/next.js/issues/25454
const withTM = require('next-transpile-modules')(['react-markdown'])

module.exports = withTM({
  target: 'serverless',
  webpack: (config, { isServer }) => {
    if (!isServer) config.resolve.fallback.fs = false
    return config
  },
  env: {
    REALM: process.env.REALM,
  },
})
