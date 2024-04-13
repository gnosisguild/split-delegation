import { Address } from 'viem'

type Base = {
  chainId: number
  registry: Address
  space: string
  account: Address
}

export type DelegationEvent =
  | {
      set: Base & {
        delegation: { delegate: Address; ratio: bigint }[]
        expiration: number
      }
    }
  | { clear: Base }
  | { expiresAt: Base & { expiration: number } }
  | { optOut: Base & { value: boolean } }
