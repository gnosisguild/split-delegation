import assert from 'assert'
import { Block, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { setPin } from 'src/loaders/loadPin'
import all from 'src/weights/all'
import createClient from 'src/loaders/createClient'
import loadScores from 'src/loaders/loadScores'
import loadWeights from 'src/loaders/loadWeights'

type Space = {
  name: string
  chain: Chain
  strategies: Strategy[]
}

type Strategy = {
  name: string
  network: string
  params: any
}

const LARGE_SPACES = [
  'safe.eth',
  'cow.eth',
  'lido-snapshot.eth',
  'rocketpool-dao.eth',
]

export default async function () {
  // const counts = await prisma.delegationEvent.groupBy({
  //   by: 'spaceId',
  //   _count: true,
  // })

  const pins: Record<string, Block> = {}
  const spaces = (await loadSpaces(LARGE_SPACES)).filter(filterSpaceByStrategy)

  for (const { name, chain, strategies } of spaces) {
    console.log(`[Pin] ${name} starting`)

    const chainId = String(chain.id)
    const client = createClient(chain)
    if (!pins[chainId]) {
      pins[chainId] = await client.getBlock()
    }
    const block = pins[chainId]

    const { weights } = await loadWeights({
      chain,
      blockNumber: Number(block.number),
      space: name,
      strategies,
    })

    const addresses = all(weights)

    await loadScores({
      chain,
      blockNumber: Number(block.number),
      space: name,
      strategies,
      addresses,
    })
    console.log(`[Pin] ${name} done`)
  }

  for (const [chainId, block] of Object.entries(pins)) {
    await setPin({ chain: chainId == '1' ? mainnet : gnosis, block })
  }
}

async function loadSpaces(spaces: string[]): Promise<Space[]> {
  const query = `
  query Spaces {
    spaces(
      where: {
        id_in: [${spaces.map((s) => `"${s}"`).join(',')}],      
      }, 
    ) {
      id         
      network      
      strategies {
        name
        network
        params
      }     
    }
  }
`

  const response = await fetch('https://hub.snapshot.org/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  const json: any = await response.json()

  return json.data.spaces.map(({ id, network, ...rest }: any) => {
    assert(network == '1' || network == '100')
    return {
      ...rest,
      name: id,
      chain: network == '1' ? mainnet : gnosis,
    }
  })
}

function filterSpaceByStrategy(space: Space) {
  if (space.strategies.length != 1) {
    return false
  }

  const [root] = space.strategies
  if (root.name != 'split-delegation') {
    return false
  }

  if (!root.params.strategies || root.params.strategies.length == 0) {
    console.error(
      `[Pin] Found misconfigured strategy ${space.name} root has no children`
    )
  }

  const forbidden = ['delegation', 'erc20-balance-of-delegation']
  for (const strategy of root.params.strategies) {
    if (forbidden.includes(strategy.name)) {
      console.error(
        `[Pin] Found misconfigured child strategy ${strategy.name} at space ${space.name}`
      )
      return false
    }
  }
  return false
}
