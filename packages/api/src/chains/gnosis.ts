import { ChainConfig } from './types'

export default {
  gateway: 'https://v2.archive.subsquid.io/network/gnosis-mainnet',
  rpc: 'https://airlock.gnosisguild.org/api/v1/100/rpc',
  chainId: 100,
  shortName: 'gno',
  finality: 25,

  deploymentBlocks: {
    DelegateRegistryV1: 0,
    DelegateRegistryV2: 0,
  },
} satisfies ChainConfig
