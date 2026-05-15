import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

export const createNextContest = inngest.createFunction(
  { id: 'create-next-contest', name: 'Create Next Contest After Archive', triggers: [{ event: 'contest/archived' }] },
  async ({ event, step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { week_number } = event.data as { contest_id: string; week_number: number }

    const durationDays = await step.run('read-config', async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('key, value')
        .in('key', ['contest_duration_days'])
      if (error) throw error
      const config = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
      return parseInt(config.contest_duration_days ?? '1', 10)
    })

    await step.run('create-contest', async () => {
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + durationDays)
      const { error } = await supabase.from('contests').insert({
        week_number: week_number + 1,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
      })
      if (error) throw error
    })

    return { created_week: week_number + 1 }
  }
)
