import { Prisma } from '@prisma/client'

import prisma from '../../prisma/singleton'

export async function cacheGet(
  key: string,
  prefix?: string
): Promise<any | null> {
  const hit = await prisma.cache.findUnique({ where: { key } })
  if (hit) {
    if (prefix) {
      console.log(`[${prefix}] Cache Hit ${key.slice(0, 18)}`)
    }
    return JSON.parse(hit.value)
  }
  return null
}

export async function cachePut(
  key: string,
  value: any | ((v: any) => string),
  prefix?: string
) {
  await prisma.$transaction(
    async (tx) => {
      let nextValue
      if (typeof value == 'function') {
        const entry = await tx.cache.findUnique({
          where: { key },
        })
        nextValue = JSON.stringify(value(entry?.value))
      } else {
        nextValue = JSON.stringify(value)
      }

      await tx.cache.upsert({
        where: { key },
        create: { key, value: nextValue },
        update: { key, value: nextValue, updatedAt: new Date(Date.now()) },
      })
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  if (prefix) {
    console.log(`[${prefix}] Cache Put ${key.slice(0, 18)}`)
  }
}

export async function cachePrune(cutoff: Date) {
  const allItems = await prisma.cache.count()

  const { count: deletedItems } = await prisma.cache.deleteMany({
    where: {
      updatedAt: { lte: cutoff },
    },
  })

  await prisma.$queryRaw`VACUUM FULL;`

  console.log(
    `[Prune] Deleted ${deletedItems} Cache Entries out of ${allItems}`
  )
}
