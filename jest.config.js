const nextJest = require('next/jest')
const { resolve } = require('path')
const { readdirSync } = require('fs')

// XXX: hack to deal with tsconfig.baseUrl: "." and tsconfig.paths
const directories = readdirSync(__dirname, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map(({ name }) => name)
  .filter((dir) => !dir.startsWith('.') && dir !== 'node_modules')
  .reduce(
    (acc, dir) => ({
      ...acc,
      [`^${dir}/(.*)$`]: resolve(__dirname, `./${dir}/$1`),
      [`^@${dir}/(.*)$`]: resolve(__dirname, `./${dir}/$1`),
    }),
    {}
  )

const customConfig = {
  moduleNameMapper: directories,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
}

module.exports = nextJest({ dir: './' })(customConfig)
