import type { VercelRequest, VercelResponse } from '@vercel/node'
import sync from 'src/commands/sync'

export const GET = async (req: VercelRequest, res: VercelResponse) => {
  await sync()
  res.status(200).send('Sync successful.')
}
