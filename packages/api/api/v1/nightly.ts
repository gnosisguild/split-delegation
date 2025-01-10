import { RequestContext } from '@vercel/edge'
import type { VercelRequest } from '@vercel/node'
import prune from '../../src/commands/prune'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const actions = async () => {
  await wait(5000)
  await prune()
}

export const GET = async (req: VercelRequest, context: RequestContext) => {
  context.waitUntil(actions())

  return new Response('Syncing...')
}
