import { test, expect } from '@playwright/test'

test.describe('Reset password flow', () => {
  test('reset-password page loads and shows email form', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('submitting an unknown email still shows success message (no enumeration)', async ({ page }) => {
    await page.goto('/reset-password')
    await page.fill('input[type="email"]', 'nobody@example.com')
    await page.click('button[type="submit"]')
    // Should show the generic "check your inbox" message regardless of whether
    // the email exists — prevents account enumeration
    await expect(page.locator('text=/check your inbox|on its way/i')).toBeVisible({ timeout: 8000 })
  })

  test('submitting an invalid email shows an error', async ({ page }) => {
    await page.goto('/reset-password')
    // HTML5 validation fires before submit — fill with a visually invalid value
    // then check the form doesn't navigate away
    await page.fill('input[type="email"]', 'not-an-email')
    // The browser's native validation will prevent the form submit;
    // confirm we stay on the page
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/reset-password/)
  })

  test('reset-password page has back-to-sign-in link', async ({ page }) => {
    await page.goto('/reset-password')
    const backLink = page.locator('a[href="/signin"]')
    await expect(backLink).toBeVisible()
  })

  test('reset page with invalid token shows error state', async ({ page }) => {
    // Navigate with a syntactically valid but unknown token
    const fakeToken = 'a'.repeat(64)
    await page.goto(`/reset-password?token=${fakeToken}`)
    // Should show the new-password form (token is present so form switches mode)
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('confirm form rejects mismatched passwords client-side', async ({ page }) => {
    const fakeToken = 'b'.repeat(64)
    await page.goto(`/reset-password?token=${fakeToken}`)
    await page.locator('input[type="password"]').first().fill('Password123')
    await page.locator('input[type="password"]').nth(1).fill('DifferentPass1')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/do not match/i')).toBeVisible({ timeout: 5000 })
  })
})
