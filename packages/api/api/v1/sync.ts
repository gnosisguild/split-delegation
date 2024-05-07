import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'
import sync from '../../src/commands/sync'
import pin from 'src/commands/pin'

const actions = async () => {
  await sync()
  await pin()
}

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(actions())

  return new Response('Syncing...')
}
