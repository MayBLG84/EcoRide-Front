/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  testEnvironment: 'jsdom',

  transform: {
    // Use jest-preset-angular for Angular templates and styles
    '^.+\\.(html|scss|css)$': 'jest-preset-angular',
    // For JS/TS files, Node can handle ESM import natively
  },

  moduleFileExtensions: ['ts', 'js', 'html', 'scss'],
};
