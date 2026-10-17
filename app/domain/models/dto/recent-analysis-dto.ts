import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class RecentAnalysisDto {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly category: LabelledValueDto,
    readonly startedAtText: string,
  ) {}
}
