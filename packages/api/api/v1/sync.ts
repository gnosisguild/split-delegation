import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'
import sync from '../../src/commands/sync'

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(sync())

  return new Response('Syncing...')
}
