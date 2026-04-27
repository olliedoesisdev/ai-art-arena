'use client'
import { useEffect, useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export function LiveVoteCount({
  artworkId,
  initialCount,
}: {
  artworkId: string
  initialCount: number
}) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const supabase = createBrowserClient()
    const channel = supabase
      .channel(`artwork-votes-${artworkId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artworks',
          filter: `id=eq.${artworkId}`,
        },
        (payload) => {
          const updated = payload.new as { vote_count: number }
          setCount(updated.vote_count)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [artworkId])

  return <span>{count.toLocaleString()}</span>
}
