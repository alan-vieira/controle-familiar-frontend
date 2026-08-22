import { defineConfig, devices } from '@playwright/test';

// URL base para testes - pode ser sobrescrita via env var BASE_URL
// Produção: https://controle-familiar-frontend.vercel.app
// Local Docker: http://localhost:8080
// Local Dev: http://localhost:5173
const baseURL = process.env.BASE_URL || 'https://controle-familiar-frontend.vercel.app';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});