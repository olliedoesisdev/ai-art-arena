import { describe, it, expect } from 'vitest'
import crypto from 'crypto'

// Mirrors the token generation + validation logic in the API routes

function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

function makeExpiresAt(minutesFromNow: number): string {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString()
}

describe('reset token generation', () => {
  it('generates a 64-char hex token', () => {
    const token = generateRawToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('each call produces a unique token', () => {
    expect(generateRawToken()).not.toBe(generateRawToken())
  })
})

describe('reset token hashing', () => {
  it('produces a consistent SHA-256 hash', () => {
    const raw = generateRawToken()
    expect(hashToken(raw)).toBe(hashToken(raw))
  })

  it('different tokens produce different hashes', () => {
    expect(hashToken(generateRawToken())).not.toBe(hashToken(generateRawToken()))
  })

  it('hash is never equal to the raw token', () => {
    const raw = generateRawToken()
    expect(hashToken(raw)).not.toBe(raw)
  })

  it('hash is 64 hex chars (SHA-256 output)', () => {
    const hash = hashToken(generateRawToken())
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]+$/)
  })
})

describe('token expiry logic', () => {
  it('a token expiring in the future is not expired', () => {
    expect(isExpired(makeExpiresAt(30))).toBe(false)
  })

  it('a token expiring in the past is expired', () => {
    expect(isExpired(makeExpiresAt(-1))).toBe(true)
  })

  it('a token expiring right now is expired (boundary)', () => {
    // Subtract 1ms to ensure we're past expiry
    const justExpired = new Date(Date.now() - 1).toISOString()
    expect(isExpired(justExpired)).toBe(true)
  })
})
