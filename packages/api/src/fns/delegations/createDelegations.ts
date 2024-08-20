import { Delegation, Registry } from './types'

export default function createDelegations(
  registry: Registry,
  when: number
): Delegation[] {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )
  const isExpired = (expiration: number) => expiration != 0 && expiration < when

  return (
    Object.entries(registry)
      // filter expired delegations
      .filter(([, { expiration }]) => !isExpired(expiration))
      .flatMap(([delegator, { delegation, expiration }]) =>
        delegation
          // filter opted out addresses
          .filter(({ delegate }) => !optedOut.has(delegate))
          .map(({ delegate, weight }) => ({
            delegator,
            delegate,
            expiration,
            weight,
          }))
      )
  )
}
