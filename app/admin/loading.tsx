import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-9 w-44" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow">
              <Skeleton className="mb-2 h-5 w-28" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-xl bg-white p-6 shadow">
          <Skeleton className="mb-4 h-6 w-36" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
