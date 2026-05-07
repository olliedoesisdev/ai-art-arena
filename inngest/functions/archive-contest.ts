import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const archiveContest = inngest.createFunction(
  { id: 'archive-contest', name: 'Archive Ended Contest', triggers: [{ cron: '0 * * * *' }] },
  async ({ step }) => {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const expired = await step.run('find-expired-contests', async () => {
      const { data, error } = await supabase
        .from('contests')
        .select('id, week_number, end_date')
        .eq('status', 'active')
        .lt('end_date', new Date().toISOString())
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
        await resend.emails.send({
          from: 'AI Art Arena <no-reply@olliedoesis.dev>',
          to: [process.env.ADMIN_EMAIL!],
          subject: `Week ${contest.week_number} contest archived`,
          html: `<p>Week ${contest.week_number} has ended and has been archived. A new contest will be created shortly.</p>`,
        })
      })

      await step.sendEvent(`trigger-next-${contest.id}`, {
        name: 'contest/archived',
        data: { contest_id: contest.id, week_number: contest.week_number },
      })
    }

    return { archived: expired.length }
  }
)
