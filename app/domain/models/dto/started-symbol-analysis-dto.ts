import type { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'

export class StartedSymbolAnalysisDto {
  constructor(
    readonly isNew: boolean,
    readonly analysisEvent: AnalysisEventDto,
  ) {}
}
