import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    const supabase = await createServerClient()

    // Get archived contests with pagination
    const { data: contests, error: contestsError, count } = await supabase
      .from('contests')
      .select('*', { count: 'exact' })
      .eq('status', 'archived')
      .order('end_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (contestsError) throw contestsError

    // For each contest, get the winner artwork details
    const contestsWithWinners = await Promise.all(
      (contests || []).map(async (contest) => {
        if (!contest.winner_id) return contest

        const { data: winner } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', contest.winner_id)
          .single()

        return {
          ...contest,
          winner,
        }
      })
    )

    return NextResponse.json({
      contests: contestsWithWinners,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching archived contests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived contests' },
      { status: 500 }
    )
  }
}
