import Decimal from 'decimal.js'

const ROUNDED_PERCENT_DECIMAL_PLACES = 2

export class RatioDomain {
  private readonly ratio: Decimal

  constructor(ratio: Decimal | number) {
    this.ratio = new Decimal(ratio)
  }

  toRoundedPercentText(): string {
    return `${this.ratio.times(100).toDecimalPlaces(ROUNDED_PERCENT_DECIMAL_PLACES).toFixed()}%`
  }

  toExactSignedPercentText(): string {
    const sign = this.ratio.greaterThan(0) ? '+' : ''
    return `${sign}${this.ratio.times(100).toFixed()}%`
  }
}
