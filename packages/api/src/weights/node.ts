import { Address, getAddress } from 'viem'
import { Graph } from './graph/types'

// export function delegators(dag: Graph<bigint>): Address[] {
//   return Object.keys(dag)
//     .map((a) => getAddress(a))
//     .sort()
// }

// export function delegates(dag: Graph<bigint>): Address[] {
//   return Array.from(
//     new Set(
//       Object.keys(dag)
//         .map((key) => Object.keys(dag[key]) as Address[])
//         .flat()
//     )
//   ).sort()
// }

// export function all(dag: Graph<bigint>) {
//   return Array.from(new Set([...delegates(dag), ...delegators(dag)]))
//     .map((address) => getAddress(address))
//     .sort()
// }

export function delegators(dag: Graph<bigint>): Address[] {
  return (Object.keys(dag) as Address[]).sort()
}

export function delegates(dag: Graph<bigint>): Address[] {
  const set = new Set<Address>()
  Object.keys(dag).forEach((key) => {
    const neighbors = Object.keys(dag[key]) as Address[]
    neighbors.forEach((neighbor) => set.add(neighbor))
  })
  return Array.from(set).sort()
}

export function all(dag: Graph<bigint>): Address[] {
  const set = new Set<Address>()
  Object.keys(dag).forEach((key) => {
    set.add(getAddress(key))
    const neighbors = Object.keys(dag[key]) as Address[]
    neighbors.forEach((neighbor) => set.add(neighbor))
  })
  return Array.from(set).sort()
}
