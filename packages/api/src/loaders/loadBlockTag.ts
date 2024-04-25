import { BlockTag, PublicClient } from 'viem'

export default async function loadBlockTag(
  blockTag: BlockTag | number,
  client: PublicClient
): Promise<number> {
  if (!isNaN(Number(blockTag))) {
    return Number(blockTag)
  }

  const { number } = await client.getBlock({ blockTag: blockTag as BlockTag })
  return Number(number)
}
