import Decimal from 'decimal.js'
import type { IAnalysisEventProxy } from '~/domain/interface/i-analysis-event-proxy'
import { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { PriceAtAnalysis } from '~/domain/models/entities/price-at-analysis'
import { StartedSymbolAnalysis } from '~/domain/models/entities/started-symbol-analysis'
import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { type EvidenceWire, type KeyEventWire, toAnalysisEvidence, toKeyEvents } from '~/infrastructure/proxy/analysis-wire'
import type { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'

type AnalysisEventWire = {
  analysisEventId: number
  symbol: string
  // older backends do not send it
  symbolName?: string
  category: string
  status: string
  failureReason?: string
  startedAt: string
  finishedAt?: string
  result?: {
    grade: string
    confidence: number
    timeHorizon: string
    reason: string
    keyEvents: KeyEventWire[] | null
    riskFactors: string[] | null
    evidence: EvidenceWire[] | null
    priceAtAnalysis: { price: string, currency: string, pricedAt: string, source: string } | null
    createdAt: string
  }
}

const HTTP_ACCEPTED = 202

export class AnalysisEventProxy implements IAnalysisEventProxy {
  constructor(private readonly backendHttpProxy: BackendHttpProxy) {}

  async startSymbolAnalysis(symbolQuery: SymbolQueryVo, apiKey: string): Promise<StartedSymbolAnalysis> {
    const response = await this.backendHttpProxy.request<AnalysisEventWire>('POST', '/analysis-events', {
      apiKey,
      body: { symbol: symbolQuery.symbol, category: symbolQuery.category },
    })
    return new StartedSymbolAnalysis(response.status === HTTP_ACCEPTED, this.toAnalysisEvent(response.body))
  }

  async getAnalysisEvent(analysisEventId: number, apiKey: string): Promise<AnalysisEvent> {
    const response = await this.backendHttpProxy.request<AnalysisEventWire>('GET', `/analysis-events/${analysisEventId}`, { apiKey })
    return this.toAnalysisEvent(response.body)
  }

  private toAnalysisEvent(analysisEvent: AnalysisEventWire): AnalysisEvent {
    const result = analysisEvent.result
    const price = result?.priceAtAnalysis
    return new AnalysisEvent(
      analysisEvent.analysisEventId,
      analysisEvent.symbol,
      analysisEvent.symbolName ?? '',
      analysisEvent.category,
      analysisEvent.status,
      analysisEvent.failureReason,
      new Date(analysisEvent.startedAt),
      analysisEvent.finishedAt === undefined ? undefined : new Date(analysisEvent.finishedAt),
      result === undefined
        ? undefined
        : new AnalysisResult(
            result.grade,
            result.confidence,
            result.timeHorizon,
            result.reason,
            toKeyEvents(result.keyEvents),
            result.riskFactors ?? [],
            toAnalysisEvidence(result.evidence),
            price ? new PriceAtAnalysis(new Decimal(price.price), price.currency, new Date(price.pricedAt), price.source) : undefined,
            new Date(result.createdAt),
          ),
    )
  }
}
