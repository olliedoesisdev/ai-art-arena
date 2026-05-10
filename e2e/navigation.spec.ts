import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('header renders all canonical nav links', async ({ page }) => {
    await page.goto('/')
    // All five canonical labels from CLAUDE.md section 3
    for (const label of ['Home', 'Contest', 'Archive', 'Leaderboard', 'About']) {
      await expect(page.locator(`nav a:has-text("${label}")`).first()).toBeVisible()
    }
  })

  test('Vote now CTA is visible in header', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a:has-text("Vote now")').first()).toBeVisible()
  })

  test('/archive loads without error', async ({ page }) => {
    await page.goto('/archive')
    await expect(page).not.toHaveURL(/error/)
    await expect(page.locator('body')).not.toContainText('500')
    await expect(page.locator('body')).not.toContainText('Internal Server Error')
  })

  test('/leaderboard loads without error', async ({ page }) => {
    await page.goto('/leaderboard')
    await expect(page).not.toHaveURL(/error/)
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('/about loads without error', async ({ page }) => {
    await page.goto('/about')
    await expect(page).not.toHaveURL(/error/)
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('/join loads without error', async ({ page }) => {
    await page.goto('/join')
    await expect(page).not.toHaveURL(/error/)
    await expect(page.locator('body')).not.toContainText('500')
  })

  test('/join?track=subscriber shows email form', async ({ page }) => {
    await page.goto('/join?track=subscriber')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 })
  })

  test('/join?track=artist shows artist onboarding', async ({ page }) => {
    await page.goto('/join?track=artist')
    // Step 1 should be visible — look for Name field
    await expect(page.locator('input[placeholder*="ame"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('unknown route shows 404 content', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-xyz')
    // Next.js returns 404 for the not-found page
    expect(response?.status()).toBe(404)
  })

  test('/signin page loads', async ({ page }) => {
    await page.goto('/signin')
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('/admin redirects unauthenticated users to /signin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/signin/)
  })
})
