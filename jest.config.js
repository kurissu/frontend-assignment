/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test|spec).ts'], // picks up *.test.ts and *.spec.ts
  moduleFileExtensions: ['ts', 'js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
