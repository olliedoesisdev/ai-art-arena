import Image from 'next/image'
import { Artwork } from '@/lib/types'
import { VoteButton } from './VoteButton'
import { LiveVoteCount } from './LiveVoteCount'
import { cn } from '@/lib/utils'

const RANK_LABELS: Record<number, string> = { 0: '🥇 1st Place', 1: '🥈 2nd Place', 2: '🥉 3rd Place' }

interface ArtworkCardProps {
  artwork: Artwork
  contestId: string
  index: number
  isLeading: boolean
  isUserVote: boolean
  hasVoted: boolean
  totalVotes: number
  contestEnded: boolean
  isAuthenticated: boolean
}

export function ArtworkCard({
  artwork,
  contestId,
  index,
  isLeading,
  isUserVote,
  hasVoted,
  totalVotes,
  contestEnded,
  isAuthenticated,
}: ArtworkCardProps) {
  const votePercentage =
    totalVotes > 0 ? ((artwork.vote_count / totalVotes) * 100).toFixed(1) : '0'
  const showResults = hasVoted || contestEnded

  return (
    <article
      className={cn(
        'overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        isUserVote && 'ring-4 ring-status-success',
        isLeading && showResults && 'ring-4 ring-brand-accent'
      )}
    >
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={artwork.image_url}
          alt={artwork.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          priority={index < 2}
          className="object-cover"
        />

        {isLeading && showResults && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-brand-accent px-3 py-1 text-sm font-bold text-yellow-900 shadow-lg">
            <span className="text-lg">🏆</span>
            {contestEnded ? 'Winner' : 'Leading'}
          </div>
        )}
        {isUserVote && (
          <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-status-success px-3 py-1 text-sm font-bold text-white shadow-lg">
            ✓ Your Vote
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="mb-2 text-xl font-bold text-brand-dark">{artwork.title}</h3>

        {artwork.artist_prompt && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            &ldquo;{artwork.artist_prompt}&rdquo;
          </p>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-2xl font-bold text-gray-900">
              <LiveVoteCount artworkId={artwork.id} initialCount={artwork.vote_count} />
            </span>
          </div>
          {showResults && totalVotes > 0 && (
            <div className="text-right">
              <div className="text-lg font-bold text-gray-700">{votePercentage}%</div>
              <div className="text-xs text-gray-500">of votes</div>
            </div>
          )}
        </div>

        {showResults && totalVotes > 0 && (
          <div className="mb-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  isLeading ? 'bg-brand-accent' : isUserVote ? 'bg-status-success' : 'bg-brand-primary'
                )}
                style={{ width: `${votePercentage}%` }}
              />
            </div>
          </div>
        )}

        {!hasVoted && !contestEnded && (
          <VoteButton
            artworkId={artwork.id}
            contestId={contestId}
            isAuthenticated={isAuthenticated}
          />
        )}

        {showResults && (
          <div className="mt-4 text-center">
            <span className="inline-block rounded-full bg-brand-surface px-3 py-1 text-sm font-semibold text-brand-dark">
              {RANK_LABELS[index] ?? `#${index + 1}`}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
