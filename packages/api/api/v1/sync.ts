import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'

const actions = async () => {
  console.log(`[Sync] noop`)
}

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(actions())

  return new Response('Syncing...')
}
