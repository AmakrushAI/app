import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './src/tests/e2e',
  outputDir: './src/tests/test-results',
  timeout: 60000
};

export default config;