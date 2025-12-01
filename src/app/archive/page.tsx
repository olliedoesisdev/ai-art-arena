'use client'

import { ArchiveGrid } from '@/components/archive'
import { useState, useEffect } from 'react'
import { CONTEST_CONFIG } from '@/lib/constants'
import type { Artwork, Contest } from '@/types'

interface Winner extends Artwork {}

interface ContestWithWinner extends Contest {
  winner?: Winner
}

interface ArchiveData {
  contests: ContestWithWinner[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ArchivePage() {
  const [data, setData] = useState<ArchiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArchive() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/contests/archived?page=${page}&limit=12`)

        if (!res.ok) {
          throw new Error('Failed to fetch archive')
        }

        const archiveData = await res.json()
        setData(archiveData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchArchive()
  }, [page])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-12 bg-slate-800 rounded-lg w-64 mx-auto mb-4" />
            <div className="h-6 bg-slate-800 rounded-lg w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(CONTEST_CONFIG.max_artworks_per_contest).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
            <p className="text-xl text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const contests = data?.contests || []
  const pagination = data?.pagination

  // Transform contests to match ArchiveGrid's expected format
  const transformedContests = contests
    .filter(c => c.winner) // Only include contests with winners
    .map(c => ({
      contest: c,
      winner: c.winner!
    }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Contest Archive
          </h1>
          <p className="text-xl text-slate-400">
            Explore past AI art competitions and their winners
          </p>
        </div>

        {/* Current Contest Link */}
        <div className="text-center mb-12">
          <a
            href="/contest"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            View Current Contest
          </a>
        </div>

        {/* Archive Grid */}
        {transformedContests.length > 0 ? (
          <>
            <ArchiveGrid contests={transformedContests} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg transition-colors"
                >
                  Previous
                </button>

                <span className="text-slate-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || loading}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl text-slate-400">No archived contests yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
