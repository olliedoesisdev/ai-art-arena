import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createHash } from 'crypto'
import { voteSchema, validateRequest, formatZodError } from '@/lib/validation'
import { rateLimiters, RateLimitError } from '@/lib/rate-limit'
import { FEATURES, HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// Helper function to hash IP address for privacy (kept for analytics)
function hashIP(ip: string): string {
  if (!process.env.IP_SALT) {
    throw new Error('IP_SALT environment variable is required for security');
  }
  return createHash('sha256').update(ip + process.env.IP_SALT).digest('hex')
}

// Helper function to get client IP (kept for analytics)
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

export async function POST(request: Request) {
  try {
    // Check if voting feature is enabled
    if (!FEATURES.VOTING) {
      return NextResponse.json(
        { error: 'Voting is currently disabled' },
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    // Apply rate limiting: 10 requests per minute per IP
    try {
      await rateLimiters.vote.check(10, ipHash)
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.RATE_LIMITED },
          { status: HTTP_STATUS.TOO_MANY_REQUESTS }
        )
      }
      throw error
    }

    // Validate request body
    const body = await request.json()
    const validation = validateRequest(voteSchema, body)

    if (!validation.success) {
      const formattedError = formatZodError(validation.error)
      return NextResponse.json(
        { error: formattedError.message, details: formattedError.errors },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const { artworkId, contestId } = validation.data

    const supabase = await createServerClient()

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    // Get user agent for analytics
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if the contest is active
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('id, status, end_date')
      .eq('id', contestId)
      .single()

    if (contestError || !contest) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONTEST_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    if (contest.status !== 'active') {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONTEST_ENDED },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    if (new Date(contest.end_date) < new Date()) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.CONTEST_ENDED },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Check if user can vote (using database function)
    const { data: canVote, error: canVoteError } = await supabase
      .rpc('can_vote', {
        p_artwork_id: artworkId,
        p_user_id: user.id,
        p_contest_id: contestId,
      })

    if (canVoteError) throw canVoteError

    if (!canVote) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.ALREADY_VOTED },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS }
      )
    }

    // Insert the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        artwork_id: artworkId,
        contest_id: contestId,
        user_id: user.id,
        user_identifier: user.id, // Use user ID as identifier for authenticated users
        ip_hash: ipHash,
        user_agent: userAgent,
      })

    if (voteError) {
      // Check if it's a duplicate vote error
      if (voteError.code === '23505') {
        return NextResponse.json(
          { error: ERROR_MESSAGES.ALREADY_VOTED },
          { status: HTTP_STATUS.TOO_MANY_REQUESTS }
        )
      }
      throw voteError
    }

    // Get updated vote count
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('vote_count')
      .eq('id', artworkId)
      .single()

    if (artworkError) throw artworkError

    return NextResponse.json({
      success: true,
      voteCount: artwork.vote_count,
      message: 'Vote recorded successfully',
    })
  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

// GET endpoint to check if user can vote for an artwork
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get('artworkId')
    const contestId = searchParams.get('contestId')

    if (!artworkId || !contestId) {
      return NextResponse.json(
        { error: 'Artwork ID and Contest ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ canVote: false, requiresAuth: true })
    }

    const { data: canVote, error } = await supabase
      .rpc('can_vote', {
        p_artwork_id: artworkId,
        p_user_id: user.id,
        p_contest_id: contestId,
      })

    if (error) throw error

    return NextResponse.json({ canVote, requiresAuth: false })
  } catch (error) {
    console.error('Error checking vote status:', error)
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    )
  }
}
