export type Graph<T> = {
  [key: string]: {
    [key: string]: T
  }
}

export type Delegations = {
  forward: Graph<{ expiration: number; weight: number }>
  reverse: Graph<{ expiration: number; weight: number }>
}

export type Scores = {
  [key: string]: number
}
