export type AddressRequestBody = {
  strategy: StrategyConfig
}

export type TopDelegatesRequestBody = {
  strategy: StrategyConfig
}

export type VotingPowerRequestBody = {
  strategy: StrategyConfig
  addresses: string[]
}

type StrategyConfig = {
  name: string
  network: string
  params: {
    delegationOverride?: boolean
    totalSupply?: number
    strategies: StrategyConfig[]
  }
}
