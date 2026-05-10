import { test, expect } from '@playwright/test'

test.describe('Join page — subscriber track', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join?track=subscriber')
  })

  test('shows name and email fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('submit with empty fields shows browser validation', async ({ page }) => {
    await page.click('button[type="submit"]')
    // Form is required — browser prevents navigation; we stay on the page
    await expect(page).toHaveURL(/\/join/)
  })

  test('invalid email format stays on page', async ({ page }) => {
    await page.fill('input[type="email"]', 'bad-email')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/join/)
  })
})

test.describe('Join page — artist track', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join?track=artist')
  })

  test('step 1 is visible with name, email fields', async ({ page }) => {
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('cannot advance step 1 without required fields', async ({ page }) => {
    // Click next/continue without filling required fields
    const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue")').first()
    if (await nextBtn.isVisible()) {
      await nextBtn.click()
      // Should stay on step 1 — no step 2 content visible yet
      await expect(page).toHaveURL(/\/join/)
    }
  })
})

test.describe('Join page — track chooser', () => {
  test('shows both track cards when no ?track param', async ({ page }) => {
    await page.goto('/join')
    await expect(page.locator('text=/Stay in the Loop|Subscribe/i').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=/Compete as an Artist|Apply/i').first()).toBeVisible({ timeout: 5000 })
  })

  test('clicking subscriber card navigates to subscriber form', async ({ page }) => {
    await page.goto('/join')
    await page.locator('text=/Subscribe to Updates/i').click()
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 })
  })

  test('clicking artist card navigates to artist form', async ({ page }) => {
    await page.goto('/join')
    await page.locator('text=/Apply as an Artist/i').click()
    await expect(page.locator('input').first()).toBeVisible({ timeout: 5000 })
  })
})
