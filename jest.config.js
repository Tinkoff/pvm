module.exports = {
  preset: 'ts-jest',
  testMatch: [
    '<rootDir>/packages/**/__tests__/**/*.spec.ts',
    '<rootDir>/src/**/__tests__/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
  ],
  setupFiles: [
    './test/jest.setup.js',
  ],
  setupFilesAfterEnv: [
    './test/setupTestFramework.js',
  ],
  globalSetup: './test/globalSetup.js',
  globalTeardown: './test/globalTeardown.js',
  testEnvironment: 'node',
  maxConcurrency: 3,
}
