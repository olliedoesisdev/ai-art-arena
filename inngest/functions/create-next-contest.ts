// This function is intentionally disabled.
// Contest creation is now manual — the admin creates each contest from the dashboard.
// The archive-contest function no longer fires contest/archived events.
// This file is kept to avoid import errors in the Inngest route handler.
import { inngest } from '../client'

export const createNextContest = inngest.createFunction(
  { id: 'create-next-contest', name: 'Create Next Contest (disabled)', triggers: [{ event: 'contest/archived-legacy' }] },
  async () => {
    // No-op — contest creation is manual via the admin dashboard.
    return { skipped: true }
  }
)
