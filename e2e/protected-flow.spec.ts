import { expect, test } from '@playwright/test'

test.describe('authenticated protected flows', () => {
  test('loads the protected dashboard with authenticated storage', async ({ page }) => {
    await page.goto('/protected')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Workouts' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Progress' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Profile' }).first()).toHaveAttribute('href', '/protected/profile')
  })

  test('opens the protected profile setup form', async ({ page }) => {
    await page.goto('/protected/profile')

    await expect(page.getByRole('heading', { name: 'Set Up Your Profile' })).toBeVisible()
    await expect(page.getByLabel('Age')).toBeVisible()
    await expect(page.getByLabel('Weight (kg)')).toBeVisible()
    await expect(page.getByLabel('Height (cm)')).toBeVisible()
    await expect(page.getByLabel('Activity Level')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeVisible()
  })
})
