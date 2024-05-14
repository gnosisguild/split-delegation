import prisma from '../../prisma/singleton'

export default async function loadEntities({
  fromBlock,
  toBlock,
}: {
  fromBlock: number
  toBlock: number
}) {
  return prisma.delegationEvent.findMany({
    where: {
      blockNumber: { gte: fromBlock, lte: toBlock },
    },
  })
}
