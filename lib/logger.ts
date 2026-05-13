import pino from 'pino'
import { NextResponse } from 'next/server'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
})

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function jsonResponse(
  requestId: string,
  body: unknown,
  init?: ResponseInit
): NextResponse {
  const res = NextResponse.json(body, init)
  res.headers.set('X-Request-Id', requestId)
  return res
}
