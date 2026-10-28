import type { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { AnalysisEventDomain } from '~/domain/models/domains/analysis-event-domain'

export class AnalysisEvent {
  constructor(
    readonly analysisEventId: number,
    readonly symbol: string,
    readonly symbolName: string,
    readonly category: string,
    readonly status: string,
    readonly failureReason: string | undefined,
    readonly startedAt: Date,
    readonly finishedAt: Date | undefined,
    readonly result: AnalysisResult | undefined,
  ) {}

  toDomain(): AnalysisEventDomain {
    return new AnalysisEventDomain(this)
  }
}
