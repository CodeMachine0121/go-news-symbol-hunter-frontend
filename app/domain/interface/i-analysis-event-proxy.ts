import type { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import type { StartedSymbolAnalysis } from '~/domain/models/entities/started-symbol-analysis'
import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'

export interface IAnalysisEventProxy {
  startSymbolAnalysis(symbolQuery: SymbolQueryVo, apiKey: string): Promise<StartedSymbolAnalysis>
  getAnalysisEvent(analysisEventId: number, apiKey: string): Promise<AnalysisEvent>
}
