import type { AnalysisResultDto } from '~/domain/models/dto/analysis-result-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class AnalysisEventDto {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly category: LabelledValueDto,
    readonly status: LabelledValueDto,
    readonly failureMessage: string | undefined,
    readonly startedAtText: string,
    readonly keepPolling: boolean,
    readonly pollingExpired: boolean,
    readonly result: AnalysisResultDto | undefined,
  ) {}
}
