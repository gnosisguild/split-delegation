import async from 'async'
import rangeToChunks from 'src/fns/rangeToChunks'
import { RpcFetch } from './types'

const PARALLELISM = 5
const MAX_RPC_BLOCK_RANGE = 3000

export default async function aggregateRpc<T>(
  { fromBlock, toBlock }: { fromBlock: number; toBlock: number },
  fetch: RpcFetch<T>
): Promise<T[]> {
  const stints = rangeToChunks(fromBlock, toBlock, MAX_RPC_BLOCK_RANGE)

  return (
    await async.mapLimit(
      stints,
      PARALLELISM,
      function (
        { from, to }: { from: number; to: number },
        done: (err: any, result: T[]) => void
      ) {
        fetch(from, to).then((result) => done(null, result))
      }
    )
  ).flat()
}
