import assert from 'assert'
import findCycle from './findCycle'
import { DAG } from './types'

export default function toAcyclic<T>(dag: DAG<T>): DAG<T> {
  while (true) {
    const cycle = findCycle(dag)
    if (!cycle) {
      return dag
    }

    assert(cycle.length > 1)
    const [from, to] = cycle
    dag = removeEdge(dag, from, to)
  }
}

function removeEdge<T>(dag: DAG<T>, from: string, to: string): DAG<T> {
  return {
    ...dag,
    [from]: Object.keys(dag[from])
      .filter((key) => key != to)
      .reduce((prev, to) => ({ ...prev, [to]: dag[from][to] }), {}),
  }
}
