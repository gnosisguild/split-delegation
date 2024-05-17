export type Graph = {
  [key: string]: {
    [key: string]: number
  }
}

export type Scores = {
  [key: string]: number
}

export type DelegationDAG = Record<
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
