import { Address } from 'viem'

export enum EventKind {
  SET,
  CLEAR,
  EXPIRATION,
  OPT_OUT,
}
export type DelegationEvent = {
  kind: EventKind
  chainId: number
  registry: Address
  space: string
  account: Address
  delegation?: { delegate: Address; ratio: bigint }[]
  expiration?: number
  optOut?: boolean
}
