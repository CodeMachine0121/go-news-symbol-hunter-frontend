import type { ITrackedSymbolGradeProxy } from '~/domain/interface/i-tracked-symbol-grade-proxy'
import { SessionGrade } from '~/domain/models/entities/session-grade'
import { TrackedSymbolGrade } from '~/domain/models/entities/tracked-symbol-grade'
import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { type EvidenceWire, type KeyEventWire, toAnalysisEvidence, toKeyEvents } from '~/infrastructure/proxy/analysis-wire'
import type { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'

type TrackedSymbolGradeWire = {
  symbol: string
  category: string
  tradingDay: string
  grade: string
  combinedScore: number
  confidence: number
  updatedAt: string
  sessionGrades: {
    session: string
    grade: string
    confidence: number
    reason: string
    keyEvents: KeyEventWire[] | null
    riskFactors: string[] | null
    evidence: EvidenceWire[] | null
    createdAt: string
  }[] | null
}

export class TrackedSymbolGradeProxy implements ITrackedSymbolGradeProxy {
  constructor(private readonly backendHttpProxy: BackendHttpProxy) {}

  async getTrackedSymbolGrades(symbolQuery: SymbolQueryVo | undefined, apiKey: string): Promise<TrackedSymbolGrade[]> {
    const response = await this.backendHttpProxy.request<TrackedSymbolGradeWire[] | null>('GET', '/tracked-symbol-grades', {
      apiKey,
      query: { symbol: symbolQuery?.symbol, category: symbolQuery?.category },
    })
    return (response.body ?? []).map(trackedSymbolGrade => new TrackedSymbolGrade(
      trackedSymbolGrade.symbol,
      trackedSymbolGrade.category,
      trackedSymbolGrade.tradingDay,
      trackedSymbolGrade.grade,
      trackedSymbolGrade.combinedScore,
      trackedSymbolGrade.confidence,
      new Date(trackedSymbolGrade.updatedAt),
      (trackedSymbolGrade.sessionGrades ?? []).map(sessionGrade => new SessionGrade(
        sessionGrade.session,
        sessionGrade.grade,
        sessionGrade.confidence,
        sessionGrade.reason,
        toKeyEvents(sessionGrade.keyEvents),
        sessionGrade.riskFactors ?? [],
        toAnalysisEvidence(sessionGrade.evidence),
        new Date(sessionGrade.createdAt),
      )),
    ))
  }
}
