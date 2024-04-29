export default function formatDecimal(number: number): string {
  const numberStr: string = number.toString()

  if (numberStr.includes('e')) {
    const [mantissa, exponent] = number.toExponential().split('e')
    const exp: number = parseInt(exponent, 10)

    if (exp < 0) {
      const zeros = '0'.repeat(Math.abs(exp) - 1)
      return `0.${zeros}${mantissa.replace('.', '')}`
    } else {
      const zeros = '0'.repeat(exp - mantissa.length + 1)
      return `${mantissa}${zeros}`
    }
  }

  return numberStr
}
