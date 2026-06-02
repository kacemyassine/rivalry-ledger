export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
  'ts-jest': {
    tsconfig: {
      jsx: 'react-jsx',
    },
  },
},
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
  testMatch: [
    '**/tests/unit/**/*.test.ts',
    '**/tests/component/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};