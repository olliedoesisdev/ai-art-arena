import { Skeleton } from '@/components/ui/Skeleton'

export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-12 w-48" />
        <Skeleton className="mb-2 h-5 w-full" />
        <Skeleton className="mb-2 h-5 w-5/6" />
        <Skeleton className="mb-10 h-5 w-4/6" />
        <Skeleton className="mb-4 h-8 w-36" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
