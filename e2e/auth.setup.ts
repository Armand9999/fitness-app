import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

import { expect, test } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'
const email = process.env.E2E_AUTH_EMAIL
const password = process.env.E2E_AUTH_PASSWORD

test('authenticate as the dedicated E2E user', async ({ page }) => {
  if (!email || !password) {
    throw new Error('E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD are required for authenticated E2E setup.')
  }

  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page).toHaveURL(/\/protected$/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  mkdirSync(dirname(authFile), { recursive: true })
  await page.context().storageState({ path: authFile })
})
