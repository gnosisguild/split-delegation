import proportionally from './proportionally'

export default function distribute(
  entries: { address: string; weight: bigint }[],
  value: number
) {
  const result = proportionally(
    value,
    entries.map(({ weight }) => weight)
  )

  return entries.map(({ address }, index) => ({
    address,
    value: result[index],
  }))
}
