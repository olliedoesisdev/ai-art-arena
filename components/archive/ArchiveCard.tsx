import Link from 'next/link'
import Image from 'next/image'
import { Contest, Artwork } from '@/lib/types'
import { WinnerBadge } from './WinnerBadge'

interface ArchiveCardProps {
  contest: Contest & { artworks?: Artwork[] }
}

export function ArchiveCard({ contest }: ArchiveCardProps) {
  const winner = contest.artworks
    ?.slice()
    .sort((a, b) => b.vote_count - a.vote_count)[0]

  const totalVotes = contest.artworks?.reduce((sum, a) => sum + a.vote_count, 0) ?? 0

  return (
    <Link href={`/archive/${contest.week_number}`} className="group block">
      <article className="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
        {winner && (
          <div className="relative aspect-video bg-gray-100">
            <Image
              src={winner.image_url}
              alt={winner.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <WinnerBadge />
          </div>
        )}
        <div className="p-5">
          <h3 className="mb-1 text-lg font-bold text-brand-dark">
            Week {contest.week_number}
          </h3>
          {winner && (
            <p className="mb-2 text-sm font-medium text-gray-700">{winner.title}</p>
          )}
          <p className="text-xs text-gray-500">
            {totalVotes.toLocaleString()} votes &middot;{' '}
            {new Date(contest.end_date).toLocaleDateString()}
          </p>
        </div>
      </article>
    </Link>
  )
}
