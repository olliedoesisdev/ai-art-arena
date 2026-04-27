import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { archiveContest } from '@/inngest/functions/archive-contest'
import { createNextContest } from '@/inngest/functions/create-next-contest'
import { sendVoteReminder } from '@/inngest/functions/send-vote-reminder'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [archiveContest, createNextContest, sendVoteReminder],
})
