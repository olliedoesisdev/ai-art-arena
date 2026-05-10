import { describe, it, expect } from 'vitest'
import { CreateContestSchema, CreateArtworkSchema, CreateCommentSchema, UpdateProfileSchema } from '@/lib/validators'

const validUUID = '123e4567-e89b-12d3-a456-426614174000'

describe('CreateContestSchema', () => {
  const validContest = {
    week_number: 1,
    start_date: '2026-01-01T00:00:00.000Z',
    end_date: '2026-01-08T00:00:00.000Z',
    status: 'active' as const,
    artwork_count: 6,
  }

  it('accepts a valid contest', () => {
    expect(CreateContestSchema.safeParse(validContest).success).toBe(true)
  })

  it('rejects week_number of 0', () => {
    expect(CreateContestSchema.safeParse({ ...validContest, week_number: 0 }).success).toBe(false)
  })

  it('rejects negative week_number', () => {
    expect(CreateContestSchema.safeParse({ ...validContest, week_number: -1 }).success).toBe(false)
  })

  it('rejects invalid status', () => {
    expect(CreateContestSchema.safeParse({ ...validContest, status: 'pending' }).success).toBe(false)
  })

  it('rejects artwork_count of 0', () => {
    expect(CreateContestSchema.safeParse({ ...validContest, artwork_count: 0 }).success).toBe(false)
  })

  it('rejects artwork_count above 50', () => {
    expect(CreateContestSchema.safeParse({ ...validContest, artwork_count: 51 }).success).toBe(false)
  })

  it('defaults status to active when omitted', () => {
    const { status: _, ...withoutStatus } = validContest
    const result = CreateContestSchema.safeParse(withoutStatus)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.status).toBe('active')
  })
})

describe('CreateArtworkSchema', () => {
  const validArtwork = {
    contest_id: validUUID,
    image_url: 'https://example.com/img.webp',
    title: 'My Artwork',
    prompt: 'A beautiful landscape',
  }

  it('accepts a valid artwork', () => {
    expect(CreateArtworkSchema.safeParse(validArtwork).success).toBe(true)
  })

  it('accepts artwork without prompt', () => {
    const { prompt: _, ...withoutPrompt } = validArtwork
    expect(CreateArtworkSchema.safeParse(withoutPrompt).success).toBe(true)
  })

  it('rejects non-UUID contest_id', () => {
    expect(CreateArtworkSchema.safeParse({ ...validArtwork, contest_id: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects non-URL image_url', () => {
    expect(CreateArtworkSchema.safeParse({ ...validArtwork, image_url: 'not-a-url' }).success).toBe(false)
  })

  it('rejects empty title', () => {
    expect(CreateArtworkSchema.safeParse({ ...validArtwork, title: '' }).success).toBe(false)
  })

  it('rejects title over 100 chars', () => {
    expect(CreateArtworkSchema.safeParse({ ...validArtwork, title: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects prompt over 500 chars', () => {
    expect(CreateArtworkSchema.safeParse({ ...validArtwork, prompt: 'a'.repeat(501) }).success).toBe(false)
  })
})

describe('CreateCommentSchema', () => {
  const validComment = {
    artwork_id: validUUID,
    name: 'Alice',
    email: 'alice@example.com',
    body: 'Great artwork!',
  }

  it('accepts a valid comment', () => {
    expect(CreateCommentSchema.safeParse(validComment).success).toBe(true)
  })

  it('accepts a comment without email', () => {
    const { email: _, ...withoutEmail } = validComment
    expect(CreateCommentSchema.safeParse(withoutEmail).success).toBe(true)
  })

  it('accepts an empty string email (treated as omitted)', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, email: '' }).success).toBe(true)
  })

  it('rejects a name shorter than 2 chars', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, name: 'A' }).success).toBe(false)
  })

  it('rejects a name longer than 50 chars', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, name: 'A'.repeat(51) }).success).toBe(false)
  })

  it('rejects a body shorter than 5 chars', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, body: 'Hi' }).success).toBe(false)
  })

  it('rejects a body longer than 500 chars', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, body: 'a'.repeat(501) }).success).toBe(false)
  })

  it('rejects an invalid email format', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects a non-UUID artwork_id', () => {
    expect(CreateCommentSchema.safeParse({ ...validComment, artwork_id: 'bad' }).success).toBe(false)
  })
})

describe('UpdateProfileSchema', () => {
  it('accepts a valid name', () => {
    expect(UpdateProfileSchema.safeParse({ name: 'Alice' }).success).toBe(true)
  })

  it('accepts a valid avatar_url', () => {
    expect(UpdateProfileSchema.safeParse({ avatar_url: 'https://example.com/avatar.png' }).success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    expect(UpdateProfileSchema.safeParse({}).success).toBe(true)
  })

  it('rejects a name over 100 chars', () => {
    expect(UpdateProfileSchema.safeParse({ name: 'a'.repeat(101) }).success).toBe(false)
  })

  it('rejects an invalid avatar_url', () => {
    expect(UpdateProfileSchema.safeParse({ avatar_url: 'not-a-url' }).success).toBe(false)
  })
})
