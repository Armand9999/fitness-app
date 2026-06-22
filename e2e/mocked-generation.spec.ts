import { expect, test } from '@playwright/test'

async function ensureE2EProfile(page: import('@playwright/test').Page) {
  await page.goto('/protected/profile')
  await page.getByLabel('Age').fill('32')
  await page.getByLabel('Weight (kg)').fill('82')
  await page.getByLabel('Height (cm)').fill('178')
  await page.getByLabel('Gender').selectOption('male')
  await page.getByLabel('Activity Level').selectOption('moderately_active')
  await page.getByLabel('Goal').selectOption('stay_fit')
  await page.getByRole('button', { name: 'Save Profile' }).click()
  await expect(page).toHaveURL(/\/protected$/)
}

test.describe('authenticated mocked AI generation', () => {
  test.beforeEach(async ({ page }) => {
    await ensureE2EProfile(page)
  })

  test('regenerates and persists a deterministic workout plan without calling OpenAI', async ({ page }) => {
    await page.goto('/protected')
    await expect(page.getByRole('heading', { name: "Today's Workout" })).toBeVisible()

    await page.getByRole('button', { name: /New Workout/ }).click()
    await expect(page.getByText('E2E Squat to Reach')).toBeVisible()
    await expect(page.getByText('E2E Incline Push-Up')).toBeVisible()

    await page.reload()
    await expect(page.getByText('E2E Squat to Reach')).toBeVisible()
    await expect(page.getByText('E2E Incline Push-Up')).toBeVisible()
  })

  test('regenerates and persists a deterministic meal plan without calling OpenAI', async ({ page }) => {
    await page.goto('/protected/profile/meal-plan')
    await expect(page.getByRole('heading', { name: "Today's Meal Plan" })).toBeVisible()

    await page.getByRole('button', { name: /New Plan/ }).click()
    await expect(page.getByText('E2E oatmeal with Greek yogurt, berries, and chia seeds.')).toBeVisible()
    await expect(page.getByText('E2E salmon plate with roasted sweet potatoes and broccoli.')).toBeVisible()

    await page.reload()
    await expect(page.getByText('E2E oatmeal with Greek yogurt, berries, and chia seeds.')).toBeVisible()
    await expect(page.getByText('E2E salmon plate with roasted sweet potatoes and broccoli.')).toBeVisible()
  })
})
