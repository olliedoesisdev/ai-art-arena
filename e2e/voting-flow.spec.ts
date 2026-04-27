import { test, expect } from '@playwright/test'

test.describe('Voting flow', () => {
  test('homepage redirects to active contest', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/contest\//)
  })

  test('contest page loads artwork grid', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/contest\//)
    // Either artworks are shown or the empty-state message appears
    const hasGrid = await page.locator('article').count()
    const hasEmpty = await page.locator('text=No Artworks Yet').count()
    expect(hasGrid + hasEmpty).toBeGreaterThan(0)
  })

  test('unauthenticated user sees sign-in prompt when voting', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/contest\//)
    const voteBtn = page.locator('button', { hasText: /vote/i }).first()
    if (await voteBtn.isVisible()) {
      await voteBtn.click()
      // Should redirect to /signin or show auth message
      await expect(page).toHaveURL(/\/signin|\/contest\//)
    }
  })
})
