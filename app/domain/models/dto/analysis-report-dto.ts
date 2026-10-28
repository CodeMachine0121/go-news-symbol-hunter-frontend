import type { AnalysisResultDto } from '~/domain/models/dto/analysis-result-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class AnalysisReportDto {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly symbolLabel: string,
    readonly category: LabelledValueDto,
    readonly fileName: string,
    readonly exportedAtText: string,
    readonly disclaimer: string,
    readonly result: AnalysisResultDto,
  ) {}
}
