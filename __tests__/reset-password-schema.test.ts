import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Mirrors the schemas in the reset-password API routes
const RequestSchema = z.object({
  email: z.string().email(),
})

const ConfirmSchema = z.object({
  token: z.string().min(64).max(64),
  password: z.string().min(8).max(72),
})

describe('reset-password/request schema', () => {
  it('accepts a valid email', () => {
    expect(RequestSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejects a missing email', () => {
    expect(RequestSchema.safeParse({}).success).toBe(false)
  })

  it('rejects a malformed email', () => {
    expect(RequestSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects an empty string email', () => {
    expect(RequestSchema.safeParse({ email: '' }).success).toBe(false)
  })
})

describe('reset-password/confirm schema', () => {
  const validToken = 'a'.repeat(64)

  it('accepts a valid token and password', () => {
    expect(ConfirmSchema.safeParse({ token: validToken, password: 'strongpass1' }).success).toBe(true)
  })

  it('rejects a token shorter than 64 chars', () => {
    expect(ConfirmSchema.safeParse({ token: 'short', password: 'strongpass1' }).success).toBe(false)
  })

  it('rejects a token longer than 64 chars', () => {
    expect(ConfirmSchema.safeParse({ token: 'a'.repeat(65), password: 'strongpass1' }).success).toBe(false)
  })

  it('rejects a password shorter than 8 chars', () => {
    expect(ConfirmSchema.safeParse({ token: validToken, password: 'short' }).success).toBe(false)
  })

  it('rejects a password longer than 72 chars', () => {
    expect(ConfirmSchema.safeParse({ token: validToken, password: 'a'.repeat(73) }).success).toBe(false)
  })

  it('rejects a missing token', () => {
    expect(ConfirmSchema.safeParse({ password: 'strongpass1' }).success).toBe(false)
  })

  it('rejects a missing password', () => {
    expect(ConfirmSchema.safeParse({ token: validToken }).success).toBe(false)
  })
})
