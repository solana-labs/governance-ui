// workaround for ESM module loader errors
// see https://github.com/vercel/next.js/issues/25454
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

// STEP 1: Add transpiler.
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

  pageExtensions: ['mdx', 'md', 'jsx', 'tsx', 'api.ts'], // .ts files are not pages

  reactStrictMode: true,
  productionBrowserSourceMaps: true,

  env: {
    MAIN_VIEW_SHOW_MAX_TOP_TOKENS_NUM:
      process.env.MAIN_VIEW_SHOW_MAX_TOP_TOKENS_NUM,
    DISABLE_NFTS: process.env.DISABLE_NFTS,
    REALM: process.env.REALM,
    MAINNET_RPC: process.env.MAINNET_RPC,
    DEVNET_RPC: process.env.DEVNET_RPC,
    DEFAULT_GOVERNANCE_PROGRAM_ID: process.env.DEFAULT_GOVERNANCE_PROGRAM_ID,
  },
})

// STEP 2: Enable bundle analyzer when `ANALYZE=true`.
config = withBundleAnalyzer(config)

if (process.env.SENTRY_AUTH_TOKEN) {
  // STEP 3: Sentry error reporting. MUST COME LAST to work with sourcemaps.
  config = withSentryConfig(config, {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore
    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
  })
}

module.exports = config
