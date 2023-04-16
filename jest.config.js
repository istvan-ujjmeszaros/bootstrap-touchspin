process.setMaxListeners(20);

module.exports = {
  'preset': 'jest-puppeteer',
  'testMatch': [
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  'testTimeout': 50000,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
