import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class AnalysisBacktestDto {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly category: LabelledValueDto,
    readonly grade: LabelledValueDto,
    readonly confidence: number,
    readonly timeHorizon: LabelledValueDto,
    readonly completedAtText: string,
    readonly entryPriceText: string,
    readonly checkpointDateText: string,
    readonly checkpointPriceText: string,
    readonly priceChangeRateText: string,
    readonly outcome: LabelledValueDto,
  ) {}
}
