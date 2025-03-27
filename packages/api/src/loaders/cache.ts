import prisma from '../../prisma/singleton'

export async function cacheGet<T>(
  key: string,
  logPrefix?: string
): Promise<T | null> {
  const hit = await prisma.cache.findUnique({ where: { key } })
  if (hit) {
    if (logPrefix) {
      console.info(`[${logPrefix}] Cache Hit ${key.slice(0, 18)}`)
    }
    return JSON.parse(hit.value) as T
  }
  return null
}

export async function cachePut(key: string, value: any, logPrefix?: string) {
  const nextValue = JSON.stringify(value)

  await prisma.cache.upsert({
    where: { key },
    create: { key, value: nextValue },
    update: { key, value: nextValue, updatedAt: new Date(Date.now()) },
  })

  if (logPrefix) {
    console.info(`[${logPrefix}] Cache Put ${key.slice(0, 18)}`)
  }
}

export async function cachePrune(cutoff: Date) {
  const allItems = await prisma.cache.count()

  const { count: deletedItems } = await prisma.cache.deleteMany({
    where: {
      updatedAt: { lte: cutoff },
    },
  })

  console.info(
    `[Prune] Deleted ${deletedItems} Cache Entries out of ${allItems}`
  )
}
