import { test, expect } from '@playwright/test'

test.describe('Rate limit API', () => {
  test('POST /api/v1/vote with invalid body returns 400', async ({ request }) => {
    const response = await request.post('/api/v1/vote', {
      data: { artwork_id: 'not-a-uuid', contest_id: 'not-a-uuid' },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid input')
  })

  test('POST /api/v1/vote with missing body returns 400', async ({ request }) => {
    const response = await request.post('/api/v1/vote', { data: {} })
    expect(response.status()).toBe(400)
  })
})
