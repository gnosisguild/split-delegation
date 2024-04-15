import { Address } from 'viem'

export type DelegationEvent = {
  chainId: number
  registry: Address
  space: string
  account: Address
} & (
  | {
      set: {
        delegation: { delegate: Address; ratio: bigint }[]
        expiration: number
      }
    }
  | { clear: {} }
  | { opt: { optOut: boolean } }
  | { expire: { expiration: number } }
)
