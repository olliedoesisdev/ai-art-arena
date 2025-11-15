import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

// Create Supabase client with service role for admin operations
function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    // Verify the cron secret to ensure this is called by Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Find contests that need to be archived
    const { data: contestsToArchive, error: fetchError } = await supabase
      .from('contests')
      .select('id, title, end_date')
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString())

    if (fetchError) throw fetchError

    if (!contestsToArchive || contestsToArchive.length === 0) {
      return NextResponse.json({
        message: 'No contests to archive',
        archived: [],
      })
    }

    // Archive each contest using the database function
    const results = await Promise.all(
      contestsToArchive.map(async (contest) => {
        try {
          const { error } = await supabase.rpc('archive_contest', {
            p_contest_id: contest.id,
          })

          if (error) throw error

          return {
            contestId: contest.id,
            title: contest.title,
            success: true,
          }
        } catch (error) {
          console.error(`Failed to archive contest ${contest.id}:`, error)
          return {
            contestId: contest.id,
            title: contest.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
      })
    )

    const successful = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    return NextResponse.json({
      message: `Archived ${successful.length} contest(s)`,
      archived: successful,
      failed: failed.length > 0 ? failed : undefined,
    })
  } catch (error) {
    console.error('Error in archive-contest cron:', error)
    return NextResponse.json(
      { error: 'Failed to archive contests' },
      { status: 500 }
    )
  }
}

// Also allow GET for manual testing (with auth)
export async function GET(request: Request) {
  return POST(request)
}
