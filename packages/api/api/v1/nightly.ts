import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'

// import audit from '../../src/commands/audit'
import integrity from '../../src/commands/integrity'

const actions = async () => {
  // await audit()
  await integrity()
}

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(actions())

  return new Response('Syncing...')
}
