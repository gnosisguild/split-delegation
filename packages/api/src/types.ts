export type Graph<T> = {
  [key: string]: {
    [key: string]: T
  }
}

export type DelegationDAG = Graph<{ expiration: number; weight: number }>

export type DelegationDAGs = {
  forward: DelegationDAG
  reverse: DelegationDAG
}

export type Scores = {
  [key: string]: number
}
