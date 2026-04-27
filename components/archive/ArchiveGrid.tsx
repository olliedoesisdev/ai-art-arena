import { Contest } from '@/lib/types'
import { ArchiveCard } from './ArchiveCard'

export function ArchiveGrid({ contests }: { contests: Contest[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {contests.map((contest) => (
        <ArchiveCard key={contest.id} contest={contest} />
      ))}
    </div>
  )
}
