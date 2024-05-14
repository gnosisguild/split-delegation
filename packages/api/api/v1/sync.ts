import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'

import heal from '../../src/commands/heal'
import pin from '../../src/commands/pin'
import sync from '../../src/commands/sync'

const actions = async () => {
  await sync()
  await heal()
  await pin()
}

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(actions())

  return new Response('Syncing...')
}
