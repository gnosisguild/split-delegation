export type Graph = {
  [key: string]: {
    [key: string]: number
  }
}

export type Delegations = {
  forward: Graph
  reverse: Graph
}

export type Scores = {
  [key: string]: number
}
