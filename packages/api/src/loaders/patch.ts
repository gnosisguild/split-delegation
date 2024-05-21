import { DelegationEvent } from '@prisma/client'

import prefix from '../fns/prefix'

import prisma from '../../prisma/singleton'

export default async function patch(diff: {
  create: DelegationEvent[]
  delete: DelegationEvent[]
}) {
  let found = 0
  let fixed = 0

  for (const entry of diff.delete) {
    found++
    await prisma.delegationEvent.delete({ where: { id: entry.id } })
    console.info(`${prefix('Heal')} delete Row ${entry.id}`)
    fixed++
  }
  for (const entry of diff.create) {
    found++
    await prisma.delegationEvent.upsert({
      where: { id: entry.id },
      create: entry,
      update: entry,
    })
    console.info(`${prefix('Heal')} create Row ${entry.id}`)
    fixed++
  }

  return { found, fixed }
}
