import { Skeleton } from '@/components/ui/Skeleton'

export default function ArchiveLoading() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-10 w-48" />
        <Skeleton className="mb-10 h-5 w-72" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-white shadow-lg">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-5">
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="mb-2 h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
