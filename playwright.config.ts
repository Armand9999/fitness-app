import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test'

const port = Number(process.env.PORT ?? 3000)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`
const authFile = 'playwright/.auth/user.json'
const hasAuthenticatedE2ECredentials = Boolean(process.env.E2E_AUTH_EMAIL && process.env.E2E_AUTH_PASSWORD)

const projects: PlaywrightTestConfig['projects'] = [
  {
    name: 'public-auth',
    testMatch: /public-auth\.spec\.ts/,
    use: { ...devices['Desktop Chrome'] },
  },
]

if (hasAuthenticatedE2ECredentials) {
  projects.push(
    {
      name: 'authenticated setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'authenticated',
      testMatch: /protected-flow\.spec\.ts/,
      dependencies: ['authenticated setup'],
      use: { ...devices['Desktop Chrome'], storageState: authFile },
    },
  )
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects,
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
