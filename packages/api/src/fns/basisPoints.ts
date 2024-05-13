export default function <T extends number | bigint>(score: T, total: T) {
  return typeof score == 'bigint'
    ? _bigint(score, total as bigint)
    : _number(score, total as number)
}

function _bigint(score: bigint, total: bigint) {
  if (total == 0n) return 0

  return Math.round(Number((score * BigInt(10000)) / total))
}

function _number(score: number, total: number) {
  if (total == 0) return 0

  return Math.round((score * 10000) / total)
}
