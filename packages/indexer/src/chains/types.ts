export interface ChainConfig {
  /** Subsquid archive, reference: https://docs.subsquid.io/subsquid-network/reference/evm-networks/ */
  gateway: string
  rpc: string
  chainId: ChainId
  shortName: string
  finality: number

  deploymentBlocks: {
    DelegateRegistryV1: number
    DelegateRegistryV2: number
  }
}

export type ChainId = 1 | 100
