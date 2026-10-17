import type Decimal from 'decimal.js'

export class AnalysisBacktest {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly category: string,
    readonly grade: string,
    readonly confidence: number,
    readonly timeHorizon: string,
    readonly completedAt: Date,
    readonly entryPrice: Decimal | undefined,
    readonly checkpointDate: string | undefined,
    readonly checkpointPrice: Decimal | undefined,
    readonly priceChangeRate: Decimal | undefined,
    readonly outcome: string,
  ) {}
}
