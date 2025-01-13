/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 12000,
  prettierPath: null, // to be able to use inline snapshots, see: https://jestjs.io/docs/configuration/#prettierpath-string
  rootDir: './src',
  // globalSetup: './test/global-setup.ts',
  // setupFilesAfterEnv: ['./test/setup-after-env.ts'],
}
