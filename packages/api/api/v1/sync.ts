import type { VercelRequest, VercelResponse } from '@vercel/node'
import sync from 'src/commands/sync'

export const GET = async (req: VercelRequest, res: VercelResponse) => {
  await sync()
  return res.send('Sync successful.')
}
