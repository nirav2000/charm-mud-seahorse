const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://127.0.0.1:4173'
  },
  webServer: {
    command: 'python3 -m http.server 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'touch-fallback-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 834, height: 1194 },
        hasTouch: true,
        isMobile: true
      }
    }
  ]
});
