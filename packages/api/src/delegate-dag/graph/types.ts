export type Graph<W> = {
  [key: string]: {
    [key: string]: W
  }
}
