const digits = /^\d+$/

// Allow BigInt to be serialized to JSON
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict'
    return () => String(this)
  },
})

export default function revive(key: string, value: string) {
  if (typeof value == 'string' && digits.test(value)) {
    return BigInt(value)
  }
  return value
}
