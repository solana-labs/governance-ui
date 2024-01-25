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
  //proxy for openserum api cors
  rewrites: async () => {
    return [
      {
        source: '/openSerumApi/:path*',
        destination: 'https://openserum.io/api/serum/:path*',
      },
    ]
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


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "solana",
    project: "realms",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
