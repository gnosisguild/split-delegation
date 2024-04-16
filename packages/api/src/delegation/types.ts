import { Address } from 'viem'

export type Registry = Record<
  string,
  {
    delegation: { delegate: Address; ratio: bigint }[]
    expiration: number
    optOut: boolean
  }
>
