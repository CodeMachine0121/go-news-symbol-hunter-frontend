import Decimal from 'decimal.js'

const PERCENT_DECIMAL_PLACES = 2

export class RatioDomain {
  private readonly ratio: Decimal

  constructor(ratio: Decimal | number) {
    this.ratio = new Decimal(ratio)
  }

  toPercentText(): string {
    return `${this.ratio.times(100).toDecimalPlaces(PERCENT_DECIMAL_PLACES).toFixed()}%`
  }

  toSignedPercentText(): string {
    const sign = this.ratio.greaterThan(0) ? '+' : ''
    return `${sign}${this.toPercentText()}`
  }
}
