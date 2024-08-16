import { Address } from 'viem'

export type DelegationAction = {
  chainId: number
  registry: Address
  account: Address
} & (
  | {
      set: {
        delegation: { delegate: Address; weight: number }[]
        expiration: number
      }
    }
  | { clear: { delegation: []; expiration: 0 } }
  | { opt: { optOut: boolean } }
  | { expire: { expiration: number } }
)

export type Registry = Record<
  string,
  {
    delegation: { delegate: Address; weight: number }[]
    expiration: number
    optOut: boolean
  }
>

export type DelegationEdge = {
  delegator: string
  delegate: string
  weight: number
  expiration: number
}
