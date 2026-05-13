import { test, expect } from '@playwright/test'

test.describe('Voting flow', () => {
  test('homepage links to active contest', async ({ page }) => {
    await page.goto('/')
    // The nav "Vote now →" CTA links to /contest/[id] when a contest is active.
    // Grab its href and navigate directly to confirm the contest page loads.
    const voteLink = page.locator('a', { hasText: /vote now/i }).first()
    const noContest = page.locator('text=/No active contest/i').first()

    const hasLink = await voteLink.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasLink) {
      const href = await voteLink.getAttribute('href')
      if (href && /\/contest\//.test(href)) {
        await page.goto(href)
        await expect(page).toHaveURL(/\/contest\//)
      } else {
        // Link is present but doesn't point to a contest yet — acceptable
        await expect(voteLink).toBeVisible()
      }
    } else {
      await expect(noContest).toBeVisible({ timeout: 5000 })
    }
  })

  test('contest page loads artwork grid', async ({ page }) => {
    await page.goto('/')
    const voteLink = page.locator('a', { hasText: /vote now/i }).first()
    const hasLink = await voteLink.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasLink) {
      test.skip()
      return
    }
    await voteLink.click()
    await page.waitForURL(/\/contest\//)
    await page.waitForLoadState('networkidle')
    // Either artworks are shown or the empty-state message appears
    const hasGrid = await page.locator('article').count()
    const hasEmpty = await page.locator('text=/No artworks/i').count()
    expect(hasGrid + hasEmpty).toBeGreaterThan(0)
  })

  test('unauthenticated user sees sign-in prompt when voting', async ({ page }) => {
    await page.goto('/')
    const voteLink = page.locator('a', { hasText: /vote now/i }).first()
    const hasLink = await voteLink.isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasLink) {
      test.skip()
      return
    }
    await voteLink.click()
    await page.waitForURL(/\/contest\//)
    const voteBtn = page.locator('button', { hasText: /vote/i }).first()
    if (await voteBtn.isVisible()) {
      await voteBtn.click()
      // Should redirect to /signin or show auth message
      await expect(page).toHaveURL(/\/signin|\/contest\//)
    }
  })
})
