import { Skeleton } from '@/components/ui/Skeleton'

export default function ArchiveWeekLoading() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-10 w-56" />
        <Skeleton className="mb-10 h-5 w-64" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-white shadow-lg">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-6">
                <Skeleton className="mb-2 h-6 w-40" />
                <Skeleton className="mb-4 h-4 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="mt-4 h-2 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
