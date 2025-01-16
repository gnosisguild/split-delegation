import { ChainConfig } from './types'

export default {
  gateway: 'https://v2.archive.subsquid.io/network/ethereum-mainnet',
  rpc: 'https://airlock.gnosisguild.org/api/v1/1/rpc',
  chainId: 1,
  shortName: 'eth',
  finality: 10,

  deploymentBlocks: {
    DelegateRegistryV1: 11225329,
    DelegateRegistryV2: 18413076,
  },
} satisfies ChainConfig
