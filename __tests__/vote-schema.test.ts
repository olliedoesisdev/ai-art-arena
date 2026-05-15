import { describe, it, expect } from 'vitest'
import { VoteSchema } from '@/lib/validators'

const validUUID = '123e4567-e89b-12d3-a456-426614174000'

describe('VoteSchema', () => {
  it('accepts a valid artwork_id', () => {
    const result = VoteSchema.safeParse({ artwork_id: validUUID })
    expect(result.success).toBe(true)
  })

  it('rejects missing artwork_id', () => {
    const result = VoteSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID artwork_id', () => {
    const result = VoteSchema.safeParse({ artwork_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects empty string artwork_id', () => {
    const result = VoteSchema.safeParse({ artwork_id: '' })
    expect(result.success).toBe(false)
  })

  it('strips extra fields gracefully', () => {
    const result = VoteSchema.safeParse({
      artwork_id: validUUID,
      extra_field: 'should be ignored',
    })
    expect(result.success).toBe(true)
  })
})
