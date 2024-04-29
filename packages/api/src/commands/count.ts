import { Hex, hexToString } from 'viem'
import prisma from '../../prisma/singleton'

/*
 * Called while syncing the DB
 */
export default async function () {
  let skip = 0
  let spaces: Record<string, number> = {}
  while (true) {
    const rows = await prisma.delegationEvent.findMany({
      take: 1000,
      skip,
    })

    if (rows.length == 0) {
      break
    }

    spaces = rows.reduce(
      (spaces, row) => ({ ...spaces, [row.spaceId]: 0 }),
      spaces
    )
    skip += rows.length
  }

  for (const spaceId of Object.keys(spaces)) {
    spaces[spaceId] = await prisma.delegationEvent.count({ where: { spaceId } })
  }

  const sortedByCount = Object.keys(spaces)
    .map((spaceId) => ({
      spaceId,
      space: hexToString(spaceId as Hex),
      count: spaces[spaceId],
    }))
    .sort((a, b) => (a.count > b.count ? -1 : 1))

  console.log(sortedByCount)
}
