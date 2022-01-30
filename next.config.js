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
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@project-serum/anchor$': '@project-serum/anchor/dist/esm',
      },
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    if (!isServer) config.resolve.fallback.fs = false
    return config
  },
  env: {
    REALM: process.env.REALM,
    MAINNET_RPC: process.env.MAINNET_RPC,
    DEVNET_RPC: process.env.DEVNET_RPC,
    DEFAULT_GOVERNANCE_PROGRAM_ID: process.env.DEFAULT_GOVERNANCE_PROGRAM_ID,
  },
  async redirects() {
    return [
      {
        source: '/dao/UXD/:path*',
        destination: '/dao/UXP/:path*',
        permanent: true,
      },
    ]
  },
})
