import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// 1 vote per IP per 24 hours per contest (key: vote:${ipHash}:${contest_id})
export const voteRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, '24 h'),
  analytics: true,
  prefix: 'vote',
})

// 100 admin requests per minute
export const adminRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'admin',
})

// 10 admin uploads per hour
export const adminUploadRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'admin_upload',
})
