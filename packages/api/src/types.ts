import { Address } from 'viem'

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
