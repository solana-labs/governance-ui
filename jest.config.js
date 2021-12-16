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

module.exports = {
  roots: ['<rootDir>'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx'],
  testPathIgnorePatterns: ['<rootDir>/(node_modules|.next)/'],
  transformIgnorePatterns: ['/node_modules/.+\\.(ts|tsx)$'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',
    ...directories,
  },
}
