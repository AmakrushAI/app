import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './src/tests/e2e',
  outputDir: '../../test-results',
  use: {
    video: 'on',
    baseURL: 'http://localhost:3000',
  },
};

export default config;
