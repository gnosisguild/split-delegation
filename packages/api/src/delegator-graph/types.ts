export type DAG<W> = {
  [key: string]: {
    [key: string]: W
  }
}
