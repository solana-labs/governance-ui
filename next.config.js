const { withSentryConfig } = require('@sentry/nextjs')
const withTM = require('next-transpile-modules')([
  'react-markdown',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-sollet',
])

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
let config

config = withTM({
  webpack: (config, { isServer }) => {
    config.experiments = { asyncWebAssembly: true, layers: true }
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
})

config = withBundleAnalyzer(config)

config.output = 'standalone'

if (process.env.SENTRY_AUTH_TOKEN) {
  config = withSentryConfig(config, {
    silent: true,
  })
}

module.exports = config
