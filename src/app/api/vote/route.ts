import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

// Helper function to hash IP address for privacy (kept for analytics)
function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex')
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
    const { artworkId, contestId } = await request.json()

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
      return NextResponse.json(
        { error: 'You must be logged in to vote' },
        { status: 401 }
      )
    }

    // Get client IP and hash it (for analytics only)
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if the contest is active
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('id, status, end_date')
      .eq('id', contestId)
      .single()

    if (contestError || !contest) {
      return NextResponse.json(
        { error: 'Contest not found' },
        { status: 404 }
      )
    }

    if (contest.status !== 'active') {
      return NextResponse.json(
        { error: 'Contest is not active' },
        { status: 400 }
      )
    }

    if (new Date(contest.end_date) < new Date()) {
      return NextResponse.json(
        { error: 'Contest has ended' },
        { status: 400 }
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
        { error: 'You have already voted for this artwork in this contest' },
        { status: 429 }
      )
    }

    // Insert the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        artwork_id: artworkId,
        contest_id: contestId,
        user_id: user.id,
        ip_hash: ipHash,
        user_agent: userAgent,
      })

    if (voteError) {
      // Check if it's a duplicate vote error
      if (voteError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted for this artwork in this contest' },
          { status: 429 }
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
      { error: 'Failed to record vote' },
      { status: 500 }
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
