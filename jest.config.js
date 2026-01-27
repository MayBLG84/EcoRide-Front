/** @type {import('jest').Config} */
module.exports = {
  // Preset for Angular
  preset: 'jest-preset-angular',

  // Polyfills and test environment setup
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  testEnvironment: 'jsdom',

  // Transform TS, HTML and CSS/SCSS files
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
    '^.+\\.(css|scss)$': 'jest-preset-angular',
  },

  // Ignore node_modules except for Angular locales and .mjs
  transformIgnorePatterns: ['node_modules/(?!.*(\\.mjs$|@angular/common/locales/.*\\.js$))'],

  moduleFileExtensions: ['ts', 'js', 'html', 'scss'],

  testMatch: ['**/?(*.)+(spec).ts'],

  // ─────────────────────────────────────────────
  // Reporters
  // ─────────────────────────────────────────────
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/reports/jest',
        outputName: 'junit.xml',
        suiteName: 'EcoRide Frontend Tests',
        classNameTemplate: '{classname}-{title}',
        titleTemplate: '{classname}-{title}',
        ancestorSeparator: ' > ',
        usePathForSuiteName: 'true',
      },
    ],
  ],

  // ─────────────────────────────────────────────
  // Ignore
  // ─────────────────────────────────────────────
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};
