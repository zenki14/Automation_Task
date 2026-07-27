import { defineConfig, devices } from '@playwright/test';

/**
 * Sauce Demo E2E configuration.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'https://www.saucedemo.com',
    // Sauce Demo uses data-test instead of data-testid.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    // Saves authenticated storageState for dependent projects.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Auth + problem-user specs must start logged out (no storageState).
    {
      name: 'chromium-unauthenticated',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /(auth|problem-user)\.spec\.ts/,
    },
    // Inventory + checkout reuse a stored standard_user session.
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/standard_user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
      testIgnore: /(auth|problem-user)\.spec\.ts/,
    },
  ],
});
