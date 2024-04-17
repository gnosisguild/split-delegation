import dotenv from 'dotenv'
import { Chain, PublicClient, createPublicClient, http } from 'viem'

dotenv.config()

export default function (chain: Chain): PublicClient {
  const url = `https://airlock.gnosisguild.org/api/v1/${chain.id}/rpc`

  // Why is airlock so slow for gc?
  return createPublicClient({
    chain,
    transport: http(url),
  })
}
