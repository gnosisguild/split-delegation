import { Hex, fromHex, trim } from 'viem'

export default function (spaceId: string) {
  return fromHex(trim(spaceId as Hex, { dir: 'right' }), 'string')
}
