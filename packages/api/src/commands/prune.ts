import { cachePrune } from 'src/loaders/cache'

export default async function () {
  await cachePrune(oneDayAgo())
}

function oneDayAgo() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000)
}
