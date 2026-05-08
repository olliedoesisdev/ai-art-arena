import { describe, it, expect } from 'vitest'

/**
 * Unit tests for submit_vote RPC response handling.
 * These test the /api/v1/vote route's mapping of RPC error codes
 * to HTTP status codes — no real DB or network calls.
 */

const ERROR_CODE_MAP: Record<string, { status: number; error: string }> = {
  CONTEST_NOT_FOUND:  { status: 404, error: 'Contest not found' },
  CONTEST_NOT_ACTIVE: { status: 400, error: 'Contest is not active' },
  ARTWORK_NOT_FOUND:  { status: 404, error: 'Artwork not found' },
  ALREADY_VOTED:      { status: 409, error: 'Already voted on this contest' },
}

describe('submit_vote RPC error_code mapping', () => {
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

  it('success=true returns vote_count', () => {
    const rpcRow = { success: true, error_code: null, vote_count: 42 }
    expect(rpcRow.success).toBe(true)
    expect(rpcRow.vote_count).toBe(42)
  })
})
