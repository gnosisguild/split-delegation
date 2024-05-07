import assert from 'assert'
import { Block, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import all from 'src/weights/all'
import createClient from 'src/loaders/createClient'
import loadScores from 'src/loaders/loadScores'
import loadWeights from 'src/loaders/loadWeights'

type Space = {
  name: string
  chain: Chain
  strategies: {
    name: string
    network: string
    params: any
  }[]
}

const LARGE_SPACES = [
  'safe.eth',
  'cow.eth',
  'lido-snapshot.eth',
  'rocketpool-dao.eth',
  'cvx.eth',
  'starknet.eth',
  'gearbox.eth',
  'snapshot.dcl.eth',
  'apecoin.eth',
]

export default async function () {
  // const counts = await prisma.delegationEvent.groupBy({
  //   by: 'spaceId',
  //   _count: true,
  // })

  const spaces = await loadSpaces(LARGE_SPACES)

  const blocks: Record<number, Block> = {}

  for (const { name, chain, strategies } of spaces) {
    console.log(`[Pin] ${name} starting`)

    const client = createClient(chain)
    if (!blocks[chain.id]) {
      blocks[chain.id] = await client.getBlock()
    }
    const block = blocks[chain.id]

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

  return json.data.spaces.map(({ id, network, strategies, ...rest }: any) => {
    assert(network == '1' || network == '100')
    return {
      ...rest,
      name: id,
      chain: network == '1' ? mainnet : gnosis,
      strategies: strategies.filter(
        (strategy: any) => strategy?.name != 'delegation'
      ),
    }
  })
}
