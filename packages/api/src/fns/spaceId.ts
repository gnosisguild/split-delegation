import assert from 'assert'
import { isHash, keccak256, stringToHex, toBytes } from 'viem'

export default function (space: string) {
  const result =
    space.length > 31
      ? keccak256(toBytes(space))
      : stringToHex(space, { size: 32 })

  assert(isHash(result))
  return result
}
