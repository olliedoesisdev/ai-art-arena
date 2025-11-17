import { ArchiveDetails } from '@/components/archive'
import { createServerClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    weekId: string
  }>
}

async function getContestDetails(weekId: string) {
  const supabase = await createServerClient()

  // Get contest by ID
  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('*')
    .eq('id', weekId)
    .single()

  if (contestError || !contest) {
    return null
  }

  // Get all artworks for this contest
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('*')
    .eq('contest_id', weekId)
    .order('vote_count', { ascending: false })

  if (artworksError) {
    throw new Error('Failed to fetch artworks')
  }

  // Get winner details if exists
  let winner = null
  if (contest.winner_artwork_id) {
    const { data: winnerData } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', contest.winner_artwork_id)
      .single()

    winner = winnerData
  }

  return {
    contest,
    artworks: artworks || [],
    winner,
  }
}

export default async function ArchiveDetailPage({ params }: PageProps) {
  const { weekId } = await params
  const data = await getContestDetails(weekId)

  if (!data) {
    notFound()
  }

  const { contest, artworks, winner } = data

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {contest.title}
          </h1>
          <p className="text-xl text-slate-400 mb-2">
            Week {contest.week_number} • {contest.year}
          </p>
          <p className="text-slate-500">
            {new Date(contest.start_date).toLocaleDateString()} -{' '}
            {new Date(contest.end_date).toLocaleDateString()}
          </p>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border border-yellow-500/50 rounded-xl p-8 mb-12 text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">
              🏆 Winner
            </h2>
            <div className="max-w-2xl mx-auto">
              <img
                src={winner.image_url}
                alt={winner.title}
                className="w-full rounded-lg mb-4 shadow-2xl"
              />
              <h3 className="text-2xl font-bold text-white mb-2">{winner.title}</h3>
              {winner.description && (
                <p className="text-slate-300 mb-4">{winner.description}</p>
              )}
              <div className="flex justify-center items-center gap-6 text-slate-300">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {winner.vote_count} votes
                </span>
              </div>
              {winner.prompt && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors">
                    View prompt
                  </summary>
                  <p className="mt-2 p-4 bg-slate-900/50 rounded-lg text-slate-300 text-sm">
                    {winner.prompt}
                  </p>
                </details>
              )}
            </div>
          </div>
        )}

        {/* All Artworks */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            All Entries
          </h2>
          <ArchiveDetails artworks={artworks} />
        </div>

        {/* Back to Archive */}
        <div className="text-center">
          <a
            href="/archive"
            className="inline-block px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            ← Back to Archive
          </a>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { weekId } = await params
  const data = await getContestDetails(weekId)

  if (!data) {
    return {
      title: 'Contest Not Found',
    }
  }

  return {
    title: `${data.contest.title} - Archive`,
    description: `View the results from Week ${data.contest.week_number} of ${data.contest.year}`,
  }
}
