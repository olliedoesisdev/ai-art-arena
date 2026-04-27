import { Artwork } from '@/lib/types'
import { ArtworkCard } from './ArtworkCard'

interface ArtworkGridProps {
  artworks: Artwork[]
  contestId: string
  hasVoted: boolean
  userVoteId?: string | null
  totalVotes: number
  contestEnded: boolean
  isAuthenticated: boolean
}

export function ArtworkGrid({
  artworks,
  contestId,
  hasVoted,
  userVoteId,
  totalVotes,
  contestEnded,
  isAuthenticated,
}: ArtworkGridProps) {
  const maxVotes = artworks.length > 0
    ? Math.max(...artworks.map((a) => a.vote_count))
    : 0

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {artworks.map((artwork, index) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          contestId={contestId}
          index={index}
          isLeading={artwork.vote_count === maxVotes && maxVotes > 0}
          isUserVote={userVoteId === artwork.id}
          hasVoted={hasVoted}
          totalVotes={totalVotes}
          contestEnded={contestEnded}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  )
}
