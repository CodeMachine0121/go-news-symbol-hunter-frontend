import type { AnalysisEvent } from '~/domain/models/entities/analysis-event'

export class StartedSymbolAnalysis {
  constructor(
    readonly isNew: boolean,
    readonly analysisEvent: AnalysisEvent,
  ) {}
}
