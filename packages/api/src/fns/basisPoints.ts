export default function (score: number, total: number) {
  if (total == 0) return 0
  return Math.round((score * 10000) / total)
}
