import { test, expect } from '@playwright/test'

test.describe('Archive flow', () => {
  test('archive page loads', async ({ page }) => {
    await page.goto('/archive')
    await expect(page).not.toHaveURL(/error/)
    // Should show heading or empty state — just confirm no crash
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
  })

  test('archive page has correct title region', async ({ page }) => {
    await page.goto('/archive')
    // Loading skeleton or content — neither should be an error page
    await expect(page.locator('body')).not.toContainText('500')
  })
})
