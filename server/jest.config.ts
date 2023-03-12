module.exports = {
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@core(.*)$': '<rootDir>/apps/core/src/modules$1',
    '^@log(.*)$': '<rootDir>/apps/log/src$1',
    '^@security(.*)$': '<rootDir>/apps/security$1',
    '^@configuration(.*)$': '<rootDir>/apps/configuration$1',
    '^@utility(.*)$': '<rootDir>/apps/utility$1',
    '^@interceptors(.*)$': '<rootDir>/apps/interceptors$1',
    '^@guards(.*)$': '<rootDir>/apps/guards$1',
    '^@decorators(.*)$': '<rootDir>/apps/decorators$1',
  },
  rootDir: '.',
  preset: 'ts-jest',
  testMatch: ['<rootDir>/**/*.unit.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverageFrom: ['__tests__/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
}
