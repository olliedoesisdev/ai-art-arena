import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const sendVoteReminder = inngest.createFunction(
  { id: 'send-vote-reminder', name: 'Send Vote Reminder 24h Before End', triggers: [{ cron: '0 * * * *' }] },
  async ({ step }) => {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) throw new Error('ADMIN_EMAIL env var is required for vote reminders')

    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    const upcoming = await step.run('find-ending-contests', async () => {
      const { data, error } = await supabase
        .from('contests')
        .select('id, contest_number, end_date')
        .eq('status', 'active')
        .gte('end_date', in24h.toISOString())
        .lte('end_date', in25h.toISOString())
      if (error) throw error
      return data ?? []
    })

    if (upcoming.length === 0) return { reminded: 0 }

    for (const contest of upcoming) {
      await step.run(`send-reminder-${contest.id}`, async () => {
        await resend.emails.send({
          from: 'AI Art Arena <no-reply@olliedoesis.dev>',
          to: [adminEmail],
          subject: `Last chance to vote — Contest #${contest.contest_number} ends soon`,
          html: `<p>Contest #${contest.contest_number} closes soon. <a href="https://olliedoesis.dev/contest/${contest.id}">Cast your vote now.</a></p>`,
        })
      })
    }

    return { reminded: upcoming.length }
  }
)
