import { expect, test } from '@playwright/test'

test.describe('public authentication journeys', () => {
  test('navigates from the home page to signup and login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Transform Your Fitness Journey' })).toBeVisible()

    await page.getByRole('link', { name: 'Get started' }).click()
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

    await page.getByRole('link', { name: 'Log in', exact: true }).last().click()
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('opens password recovery from login and validates email', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Forgot your password?' }).click()
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()

    await page.locator('form').evaluate((form) => { form.noValidate = true })
    await page.getByLabel('Email address').fill('invalid-email')
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'valid email address' })).toBeVisible()
  })

  test('validates replacement password strength and confirmation', async ({ page }) => {
    await page.goto('/reset-password')
    await page.getByLabel('New password', { exact: true }).fill('weak')
    await page.getByLabel('Confirm new password', { exact: true }).fill('different')
    await page.getByRole('button', { name: 'Update password' }).click()

    await expect(page.getByText('Password must be at least 8 characters long.')).toBeVisible()
    await expect(page.getByText('Passwords do not match.')).toBeVisible()
  })

  test('shows signup validation without calling external services', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('form').evaluate((form) => { form.noValidate = true })
    await page.getByLabel('Full name').fill('A')
    await page.getByLabel('Email address').fill('invalid-email')
    await page.getByLabel('Password').fill('weak')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText('Name must be at least 2 characters long.')).toBeVisible()
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
  })
})
