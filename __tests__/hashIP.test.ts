import { describe, it, expect, beforeAll } from 'vitest'
import { hashIP } from '@/lib/utils'

beforeAll(() => {
  process.env.IP_HASH_SALT = 'test-salt'
})

describe('hashIP', () => {
  it('returns a 32-character hex string', () => {
    const result = hashIP('127.0.0.1')
    expect(result).toHaveLength(32)
    expect(result).toMatch(/^[0-9a-f]+$/)
  })

  it('is deterministic for the same input', () => {
    expect(hashIP('192.168.1.1')).toBe(hashIP('192.168.1.1'))
  })

  it('produces different hashes for different IPs', () => {
    expect(hashIP('1.1.1.1')).not.toBe(hashIP('2.2.2.2'))
  })

  it('uses the salt — same IP different salt yields different hash', () => {
    const hash1 = hashIP('1.1.1.1')
    process.env.IP_HASH_SALT = 'different-salt'
    const hash2 = hashIP('1.1.1.1')
    expect(hash1).not.toBe(hash2)
  })
})
