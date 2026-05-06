import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { VoteSchema } from '@/lib/validators'
import { voteRateLimit } from '@/lib/ratelimit'
import { getClientIP, hashIP } from '@/lib/utils'
import { auth } from '@/auth'
import { logger, generateRequestId } from '@/lib/logger'

export async function POST(request: Request) {
  const requestId = generateRequestId()
  const start = Date.now()
  logger.info({ requestId, path: '/api/v1/vote' }, 'vote request received')

  try {
    // 1. Parse body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // 2. Zod validate — reject before touching DB or Redis
    const result = VoteSchema.safeParse(body)
    if (!result.success) {
      logger.warn({ requestId, issues: result.error.issues }, 'vote validation failed')
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }
    const { artwork_id, contest_id } = result.data

    // 3. Hash IP
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    // 4. Upstash rate limit check
    const rateLimitKey = `vote:${ipHash}:${contest_id}`
    let allowed: boolean, reset: number
    try {
      const rl = await voteRateLimit.limit(rateLimitKey)
      allowed = rl.success
      reset = rl.reset
    } catch (rlError) {
      logger.error({ requestId, rlError }, 'rate limit check failed')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    if (!allowed) {
      logger.warn({ requestId, rateLimitKey }, 'vote rate limited')
      return NextResponse.json(
        { error: 'Rate limit exceeded', reset_at: new Date(reset).toISOString() },
        { status: 429 }
      )
    }

    // 5. Call submit_vote RPC (atomic — no sequential queries)
    const session = await auth()
    const userId = session?.user?.id ?? null

    const supabase = await createClient()
    const { data, error } = await supabase
      .rpc('submit_vote', {
        p_artwork_id: artwork_id,
        p_contest_id: contest_id,
        p_user_id:    userId,
        p_ip_hash:    ipHash,
      })
      .single()

    if (error) {
      logger.error({ requestId, error }, 'submit_vote RPC error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const row = data as { success: boolean; error_code: string | null; vote_count: number }

    if (!row.success) {
      const map: Record<string, { status: number; error: string }> = {
        CONTEST_NOT_FOUND: { status: 404, error: 'Contest not found' },
        CONTEST_NOT_ACTIVE: { status: 400, error: 'Contest is not active' },
        ARTWORK_NOT_FOUND:  { status: 404, error: 'Artwork not found' },
        ALREADY_VOTED:      { status: 409, error: 'Already voted on this contest' },
      }
      const mapped = map[row.error_code ?? ''] ?? { status: 500, error: 'Internal server error' }
      logger.warn({ requestId, error_code: row.error_code }, 'vote rejected by RPC')
      return NextResponse.json({ error: mapped.error }, { status: mapped.status })
    }

    // 6. Revalidate contest page ISR cache, return 200
    revalidatePath(`/contest/${contest_id}`)

    const ms = Date.now() - start
    logger.info({ requestId, ms, vote_count: row.vote_count }, 'vote accepted')
    return NextResponse.json({ success: true, vote_count: row.vote_count })
  } catch (error) {
    const ms = Date.now() - start
    logger.error({ requestId, ms, error }, 'vote unhandled error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
