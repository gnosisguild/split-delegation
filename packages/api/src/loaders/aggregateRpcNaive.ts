import rangeToChunks from 'src/fns/rangeToChunks'
import { RpcFetch } from './types'

const CHUNK_SIZE = 5000

export default async function aggregateRpcNaive<T>(
  { fromBlock, toBlock }: { fromBlock: number; toBlock: number },
  fetch: RpcFetch<T>
): Promise<T[]> {
  let result: T[] = []
  const chunks = rangeToChunks(fromBlock, toBlock, CHUNK_SIZE)

  for (const { from, to } of chunks) {
    result = [...result, ...(await fetch(from, to))]
  }
  return result
}
