import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './src/tests/e2e',
  outputDir: './src/tests/test-results',
  use: {
    video: 'on',
    baseURL: 'http://localhost:3000/',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000/',
    timeout: 120000,
  },
};

export default config;