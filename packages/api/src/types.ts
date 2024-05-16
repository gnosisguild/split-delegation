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

export type Weights = {
  [key: string]: {
    [key: string]: number
  }
}

export type Scores = {
  [key: string]: number
}

export type DelegationGraph = Record<
  string,
  {
    incoming: {
      address: string
      direct: boolean
      weight: number
      ratio: number
    }[]
    outgoing: {
      address: string
      direct: boolean
      weight: number
      ratio: number
    }[]
  }
>

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
