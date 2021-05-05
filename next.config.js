module.exports = {
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
}
