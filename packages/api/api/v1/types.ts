export type AddressRequestBody = {
  totalSupply: number
  strategies: any[]
  network: any
}

export type TopDelegatesRequestBody = {
  totalSupply: number
  strategies: any[]
  network: any
}

export type VotingPowerRequestBody = {
  options: {
    strategies: any[]
    network: string
    delegationOverride?: boolean
  }
  addresses: string[]
}
