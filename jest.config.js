process.setMaxListeners(20);

module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testTimeout: 50000,
};
