import { Address } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'
import { merge } from 'src/fns/bag'

export default async function loadScores({
  space,
  strategies,
  network,
  addresses,
  blockNumber,
}: {
  space: string
  strategies: any[]
  network: string
  addresses: Address[]
  blockNumber: number
}): Promise<Record<Address, number>> {
  const result = (await snapshot.utils.getScores(
    space,
    strategies,
    network,
    addresses,
    blockNumber
  )) as Record<Address, number>[]

  const bag = result.length == 1 ? result[0] : merge(result)

  return Object.fromEntries(
    addresses.map((address) => [address, bag[address] || 0])
  )
}
