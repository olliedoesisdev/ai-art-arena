import { describe, it, expect } from 'vitest'
import { VoteSchema } from '@/lib/validators'

const validUUID = '123e4567-e89b-12d3-a456-426614174000'

describe('VoteSchema', () => {
  it('accepts valid UUIDs', () => {
    const result = VoteSchema.safeParse({ artwork_id: validUUID, contest_id: validUUID })
    expect(result.success).toBe(true)
  })

  it('rejects missing artwork_id', () => {
    const result = VoteSchema.safeParse({ contest_id: validUUID })
    expect(result.success).toBe(false)
  })

  it('rejects missing contest_id', () => {
    const result = VoteSchema.safeParse({ artwork_id: validUUID })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID artwork_id', () => {
    const result = VoteSchema.safeParse({ artwork_id: 'not-a-uuid', contest_id: validUUID })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID contest_id', () => {
    const result = VoteSchema.safeParse({ artwork_id: validUUID, contest_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('rejects empty strings', () => {
    const result = VoteSchema.safeParse({ artwork_id: '', contest_id: '' })
    expect(result.success).toBe(false)
  })

  it('rejects extra fields gracefully (passes — Zod strips extras)', () => {
    const result = VoteSchema.safeParse({
      artwork_id: validUUID,
      contest_id: validUUID,
      extra_field: 'should be ignored',
    })
    expect(result.success).toBe(true)
  })
})
