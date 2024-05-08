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

export type Weights<W> = {
  [key: string]: {
    [key: string]: W
  }
}

export type Scores = {
  [key: string]: number
}

export type DelegateRequestBody = {
  totalSupply: number
  strategies: any[]
  network: any
}

export type DelegatorRequestBody = {
  totalSupply: number
  strategies: any[]
  network: any
}

export type VotingPowerRequestBody = {
  options: { strategies: any[]; network: string }
  addresses: string[]
}
