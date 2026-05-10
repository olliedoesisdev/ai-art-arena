import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { VoteSchema } from '@/lib/validators'
import { voteRateLimit, buildVoteRateLimitKey, hashEmail } from '@/lib/ratelimit'
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

    // 3. Resolve identity — email for authed users, IP for anonymous.
    //    Auth failure is non-fatal: treat as anonymous rather than throwing.
    let userEmail: string | null = null
    let userId: string | null = null
    try {
      const session = await auth()
      userEmail = session?.user?.email ?? null
      userId = session?.user?.id ?? null
    } catch {
      // stay anonymous
    }

    // 4. Hash IP — reject if no IP headers (prevents hash collision)
    const clientIP = getClientIP(request)
    if (!clientIP) {
      logger.warn({ requestId }, 'vote rejected: no IP headers')
      return NextResponse.json({ error: 'Unable to verify request origin' }, { status: 400 })
    }
    const ipHash = hashIP(clientIP)

    // 5. Rate limit — keyed by email hash for authed users, IP hash for anon
    const rateLimitKey = buildVoteRateLimitKey(userEmail, ipHash, contest_id)
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
      const resetDate = new Date(reset)
      const hoursUntilReset = Math.ceil(
        (resetDate.getTime() - Date.now()) / (1000 * 60 * 60)
      )
      const errorMessage = userEmail
        ? `You have already voted today. Your next vote is available in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}.`
        : `This device has already voted today. Sign in with your email to vote from any device. Next vote available in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}.`

      logger.warn({ requestId, rateLimitKey, isAuthenticated: !!userEmail }, 'vote rate limited')
      return NextResponse.json(
        {
          error: errorMessage,
          reset_at: resetDate.toISOString(),
          isAuthenticated: !!userEmail,
        },
        { status: 429 }
      )
    }

    // 6. Call submit_vote RPC (atomic — no sequential queries)
    const emailHash = userEmail ? hashEmail(userEmail) : null

    const supabase = await createClient()
    const { data, error } = await supabase
      .rpc('submit_vote', {
        p_artwork_id:  artwork_id,
        p_contest_id:  contest_id,
        p_user_id:     userId,
        p_ip_hash:     ipHash,
        p_email_hash:  emailHash,
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

    // 7. Revalidate contest page ISR cache, return 200
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
