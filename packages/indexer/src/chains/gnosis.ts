import { ChainConfig } from './types'

export default {
  gateway: 'https://v2.archive.subsquid.io/network/gnosis-mainnet',
  rpc: 'https://airlock.gnosisguild.org/api/v1/100/rpc',
  chainId: 100,
  shortName: 'gno',
  finality: 20,

  deploymentBlocks: {
    DelegateRegistryV1: 20274491,
    DelegateRegistryV2: 26474496,
  },
} satisfies ChainConfig
