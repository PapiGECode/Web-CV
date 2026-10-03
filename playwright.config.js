import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.js', timeout: 30000, retries: 0, workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000', browserName: 'chromium',
    launchOptions: { executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] },
    screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: process.env.TEST_BASE_URL ? undefined : { command: 'node scripts/serve.mjs', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
});
