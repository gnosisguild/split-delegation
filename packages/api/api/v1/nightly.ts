import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'

import { cachePrune } from '../../src/loaders/cache'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const actions = async () => {
  await wait(5000)
  await cachePrune(oneDayAgo())
}

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(actions())

  return new Response('Syncing...')
}

function oneDayAgo() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000)
}
