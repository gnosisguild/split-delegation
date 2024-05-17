export type DelegateRequestBody = {
  totalSupply: number
  strategies: any[]
  network: any
}

export type DelegatorRequestBody = {
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
