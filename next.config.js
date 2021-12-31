// workaround for ESM module loader errors
// see https://github.com/vercel/next.js/issues/25454
const withTM = require('next-transpile-modules')([
  'react-markdown',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-sollet',
])

module.exports = withTM({
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    if (!isServer) config.resolve.fallback.fs = false
    return config
  },
  distDir: 'out',
  env: {
    REALM: process.env.REALM,
    DEFAULT_GOVERNANCE_PROGRAM_ID: process.env.DEFAULT_GOVERNANCE_PROGRAM_ID,
  },
})
