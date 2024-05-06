import assert from 'assert'
import { writeFileSync } from 'fs'

export default async function () {
  const response = await fetch(
    'https://safe-claiming-app-data.safe.global/allocations/1/snapshot-allocations-data.json',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const safeAllocations = (await response.json()) as any[]

  sanity(safeAllocations)

  const result = safeAllocations.map((allocation) =>
    allocation.map(({ account, amount, contract, vestingId }: any) => ({
      account,
      amount,
      contract,
      vestingId,
    }))
  )

  writeFileSync(
    './api/v1/safe.eth/snapshot-allocations-trimmed.json',
    JSON.stringify(result, null, 4)
  )
}

function sanity(allocations: any[]) {
  for (const allocation of allocations as any[]) {
    assert(
      Array.isArray(allocation) &&
        allocation.every(
          (entry) =>
            Object.keys(entry).sort().join(',') ==
            'account,amount,chainId,contract,curve,durationWeeks,proof,startDate,tag,vestingId'
        ),
      'Unexpected Format'
    )
  }
}
