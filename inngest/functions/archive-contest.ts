import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const archiveContest = inngest.createFunction(
  { id: 'archive-contest', name: 'Advance Contest Lifecycle', triggers: [{ cron: '0 * * * *' }] },
  async ({ step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date().toISOString()

    // Advance upcoming → active when start_date has passed
    await step.run('activate-ready-contests', async () => {
      const { error } = await supabase
        .from('contests')
        .update({ status: 'active' })
        .eq('status', 'upcoming')
        .lt('start_date', now)
      if (error) throw error
    })

    // Find all active contests past their end_date
    const expired = await step.run('find-expired-contests', async () => {
      const { data, error } = await supabase
        .from('contests')
        .select('id, contest_number, contest_type, theme')
        .eq('status', 'active')
        .lt('end_date', now)
      if (error) throw error
      return data ?? []
    })

    if (expired.length === 0) return { archived: 0 }

    for (const contest of expired) {
      await step.run(`archive-contest-${contest.id}`, async () => {
        const { error } = await supabase
          .from('contests')
          .update({ status: 'archived' })
          .eq('id', contest.id)
        if (error) throw error
      })

      await step.run(`notify-archived-${contest.id}`, async () => {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const label = contest.theme ?? `Contest #${contest.contest_number}`
        const typeLabel = contest.contest_type === 'photo' ? 'Photo Contest' : 'AI Art Contest'
        await resend.emails.send({
          from: 'AI Art Arena <no-reply@olliedoesis.dev>',
          to: [process.env.ADMIN_EMAIL!],
          subject: `${typeLabel} "${label}" has been archived`,
          html: `<p>${typeLabel} "${label}" has ended and has been archived. Create the next contest from the admin dashboard.</p>`,
        })
      })
    }

    return { archived: expired.length }
  }
)
