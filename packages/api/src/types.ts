export type Graph<T> = {
  [key: string]: {
    [key: string]: T
  }
}

export type Delegations = {
  forward: Graph<number>
  reverse: Graph<number>
}

export type Scores = {
  [key: string]: number
}
