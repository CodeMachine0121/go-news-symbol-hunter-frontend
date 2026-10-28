import type Decimal from 'decimal.js'

export class AnalysisBacktest {
  constructor(
    // only manual grade records belong to an analysis event
    readonly analysisEventId: number | undefined,
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
    readonly gradeRecordId: number,
    readonly source: string,
    // only background grade records have a trading day
    readonly tradingDay: string | undefined,
  ) {}
}
