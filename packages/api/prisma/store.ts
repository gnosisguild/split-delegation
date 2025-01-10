import assert from 'node:assert'
import prisma from './singleton'

type ChainId = 1 | 100

interface HashAndHeight {
  height: number
  hash: string
}

interface FinalTxInfo {
  prevHead: HashAndHeight
  nextHead: HashAndHeight
}

export class DatabaseStore {
  constructor(private chainId: ChainId) {
    this.chainId = chainId
  }

  async connect(): Promise<HashAndHeight> {
    const checkpoint = await prisma.checkpoint.findUnique({
      where: { chainId: this.chainId },
    })

    return checkpoint
      ? { height: checkpoint.blockNumber, hash: checkpoint.hash }
      : INITIAL_STATE
  }

  async disconnect(): Promise<void> {}

  async transact(
    info: FinalTxInfo,
    handler: (store: any) => Promise<void>
  ): Promise<void> {
    const chainId = this.chainId
    assert(typeof chainId == 'number')

    const { height, hash } = info.nextHead

    await handler(undefined as any)

    await prisma.checkpoint.upsert({
      create: { chainId, blockNumber: height, hash },
      update: { blockNumber: height, hash },
      where: { chainId },
    })
  }
}

const INITIAL_STATE: HashAndHeight = {
  height: -1,
  hash: '0x',
}
