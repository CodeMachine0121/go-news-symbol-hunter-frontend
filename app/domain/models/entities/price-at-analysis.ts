import type Decimal from 'decimal.js'

export class PriceAtAnalysis {
  constructor(
    readonly price: Decimal,
    readonly currency: string,
    readonly pricedAt: Date,
    readonly source: string,
  ) {}
}
