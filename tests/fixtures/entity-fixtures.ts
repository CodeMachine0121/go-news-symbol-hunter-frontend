import Decimal from 'decimal.js'
import { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { KeyEvent } from '~/domain/models/entities/key-event'
import { PriceAtAnalysis } from '~/domain/models/entities/price-at-analysis'

export const STARTED_AT = new Date('2026-10-16T02:00:00Z')

export const createPriceAtAnalysis = (price = '1085.5', currency = 'TWD'): PriceAtAnalysis =>
  new PriceAtAnalysis(new Decimal(price), currency, new Date('2026-10-16T05:30:00Z'), '證交所')

export const createAnalysisResult = (overrides: { grade?: string, priceAtAnalysis?: PriceAtAnalysis | null } = {}): AnalysisResult =>
  new AnalysisResult(
    overrides.grade ?? 'bullish',
    72,
    'short',
    '營收創新高',
    [new KeyEvent('法說會上修財測', 'https://news.example/1', new Date('2026-10-15T08:00:00Z'))],
    ['匯率波動'],
    [new AnalysisEvidence('法說會上修財測', 'https://news.example/1', new Date('2026-10-15T08:00:00Z'), '鉅亨網')],
    overrides.priceAtAnalysis === null ? undefined : overrides.priceAtAnalysis ?? createPriceAtAnalysis(),
    new Date('2026-10-16T02:01:00Z'),
  )

export const createAnalysisEvent = (overrides: {
  analysisEventId?: number
  symbol?: string
  category?: string
  status?: string
  failureReason?: string
  startedAt?: Date
  result?: AnalysisResult
} = {}): AnalysisEvent =>
  new AnalysisEvent(
    overrides.analysisEventId ?? 1,
    overrides.symbol ?? 'BTC',
    overrides.category ?? 'crypto',
    overrides.status ?? 'running',
    overrides.failureReason,
    overrides.startedAt ?? STARTED_AT,
    undefined,
    overrides.result,
  )

