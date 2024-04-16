import { Address } from 'viem'

export type DelegationAction = {
  chainId: number
  registry: Address
  account: Address
} & (
  | {
      set: {
        delegation: { delegate: Address; ratio: bigint }[]
        expiration: number
      }
    }
  | { clear: { delegation: []; expiration: 0 } }
  | { opt: { optOut: boolean } }
  | { expire: { expiration: number } }
)
