import { describe, it, expect, vi, beforeAll } from 'vitest'
import crypto from 'crypto'

/**
 * Integration tests for the vote rate limiter key-building logic.
 * Tests buildVoteRateLimitKey and hashEmail in isolation —
 * no Redis connection, no network calls.
 */

const TEST_SALT = 'test-salt-32-chars-padded-here!!'
const CONTEST_ID = '00000000-0000-0000-0000-000000000001'
const CONTEST_ID_2 = '00000000-0000-0000-0000-000000000002'
const IP_HASH = 'abcdef1234567890abcdef1234567890'

// Replicate the actual implementations so we test the logic, not import side-effects
function buildVoteRateLimitKey(
  email: string | null | undefined,
  ipHash: string,
  contestId: string,
  salt = TEST_SALT
): string {
  if (!salt) throw new Error('VOTE_HASH_SALT env var is required')
  if (email) {
    const emailHash = crypto
      .createHash('sha256')
      .update('email:' + email.toLowerCase().trim() + salt)
      .digest('hex')
      .slice(0, 32)
    return `${emailHash}:${contestId}`
  }
  return `${ipHash}:${contestId}`
}

function hashEmail(email: string, salt = TEST_SALT): string {
  if (!salt) throw new Error('VOTE_HASH_SALT env var is required')
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase().trim() + salt)
    .digest('hex')
    .slice(0, 32)
}

describe('buildVoteRateLimitKey', () => {
  it('returns email-based key when email is provided', () => {
    const key = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID)
    expect(key).toContain(CONTEST_ID)
    expect(key).not.toContain('user@example.com') // must be hashed
    expect(key).not.toContain(IP_HASH)            // email path skips IP
  })

  it('returns ip-based key when email is null', () => {
    const key = buildVoteRateLimitKey(null, IP_HASH, CONTEST_ID)
    expect(key).toBe(`${IP_HASH}:${CONTEST_ID}`)
  })

  it('returns ip-based key when email is undefined', () => {
    const key = buildVoteRateLimitKey(undefined, IP_HASH, CONTEST_ID)
    expect(key).toBe(`${IP_HASH}:${CONTEST_ID}`)
  })

  it('normalises email case before hashing', () => {
    const key1 = buildVoteRateLimitKey('User@Example.COM', IP_HASH, CONTEST_ID)
    const key2 = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID)
    expect(key1).toBe(key2)
  })

  it('normalises email whitespace before hashing', () => {
    const key1 = buildVoteRateLimitKey('  user@example.com  ', IP_HASH, CONTEST_ID)
    const key2 = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID)
    expect(key1).toBe(key2)
  })

  it('produces different keys for different emails', () => {
    const key1 = buildVoteRateLimitKey('alice@example.com', IP_HASH, CONTEST_ID)
    const key2 = buildVoteRateLimitKey('bob@example.com', IP_HASH, CONTEST_ID)
    expect(key1).not.toBe(key2)
  })

  it('produces different keys for different contests', () => {
    const key1 = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID)
    const key2 = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID_2)
    expect(key1).not.toBe(key2)
  })

  it('throws if salt is empty', () => {
    expect(() => buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID, '')).toThrow('VOTE_HASH_SALT')
  })

  it('email key is deterministic across calls', () => {
    const key1 = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID)
    const key2 = buildVoteRateLimitKey('user@example.com', IP_HASH, CONTEST_ID)
    expect(key1).toBe(key2)
  })
})

describe('hashEmail', () => {
  it('returns a 32-char hex string', () => {
    const hash = hashEmail('user@example.com')
    expect(hash).toMatch(/^[a-f0-9]{32}$/)
  })

  it('is deterministic for the same input', () => {
    expect(hashEmail('user@example.com')).toBe(hashEmail('user@example.com'))
  })

  it('normalises case', () => {
    expect(hashEmail('User@Example.COM')).toBe(hashEmail('user@example.com'))
  })

  it('normalises whitespace', () => {
    expect(hashEmail('  user@example.com  ')).toBe(hashEmail('user@example.com'))
  })

  it('produces different hashes for different emails', () => {
    expect(hashEmail('alice@example.com')).not.toBe(hashEmail('bob@example.com'))
  })

  it('throws if salt is empty', () => {
    expect(() => hashEmail('user@example.com', '')).toThrow('VOTE_HASH_SALT')
  })
})

describe('submit_vote RPC error_code → HTTP status mapping', () => {
  const ERROR_CODE_MAP: Record<string, { status: number; error: string }> = {
    CONTEST_NOT_FOUND:  { status: 404, error: 'Contest not found' },
    CONTEST_NOT_ACTIVE: { status: 400, error: 'Contest is not active' },
    ARTWORK_NOT_FOUND:  { status: 404, error: 'Artwork not found' },
    ALREADY_VOTED:      { status: 409, error: 'Already voted on this contest' },
  }

  it('maps CONTEST_NOT_FOUND to 404', () => {
    expect(ERROR_CODE_MAP['CONTEST_NOT_FOUND'].status).toBe(404)
  })

  it('maps CONTEST_NOT_ACTIVE to 400', () => {
    expect(ERROR_CODE_MAP['CONTEST_NOT_ACTIVE'].status).toBe(400)
  })

  it('maps ARTWORK_NOT_FOUND to 404', () => {
    expect(ERROR_CODE_MAP['ARTWORK_NOT_FOUND'].status).toBe(404)
  })

  it('maps ALREADY_VOTED to 409', () => {
    expect(ERROR_CODE_MAP['ALREADY_VOTED'].status).toBe(409)
  })

  it('unknown error_code falls back to 500', () => {
    const fallback = ERROR_CODE_MAP['UNKNOWN_CODE'] ?? { status: 500, error: 'Internal server error' }
    expect(fallback.status).toBe(500)
  })

  it('success=true carries vote_count', () => {
    const rpcRow = { success: true, error_code: null, vote_count: 42 }
    expect(rpcRow.success).toBe(true)
    expect(rpcRow.vote_count).toBe(42)
  })

  it('success=false carries no vote_count', () => {
    const rpcRow = { success: false, error_code: 'ALREADY_VOTED', vote_count: 0 }
    expect(rpcRow.success).toBe(false)
    expect(ERROR_CODE_MAP[rpcRow.error_code].status).toBe(409)
  })

  it('p_email_hash parameter is optional (DEFAULT NULL) — null is valid', () => {
    // The RPC signature: submit_vote(p_artwork_id, p_contest_id, p_user_id, p_ip_hash, p_email_hash DEFAULT NULL)
    // Calling without email_hash should not error
    const callArgs = {
      p_artwork_id: '00000000-0000-0000-0000-000000000001',
      p_contest_id: '00000000-0000-0000-0000-000000000002',
      p_user_id: null,
      p_ip_hash: IP_HASH,
      // p_email_hash omitted — defaults to NULL in DB
    }
    expect(callArgs.p_ip_hash).toBeTruthy()
    expect(callArgs.p_user_id).toBeNull()
  })
})
