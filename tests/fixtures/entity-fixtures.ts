import Decimal from 'decimal.js'
import { AnalysisEvent } from '~/domain/models/entities/analysis-event'
import { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { KeyEvent } from '~/domain/models/entities/key-event'
import { PriceAtAnalysis } from '~/domain/models/entities/price-at-analysis'
import { SessionGrade } from '~/domain/models/entities/session-grade'
import { TrackedSymbolGrade } from '~/domain/models/entities/tracked-symbol-grade'

export const STARTED_AT = new Date('2026-10-16T02:00:00Z')

export const createPriceAtAnalysis = (price = '1085.5', currency = 'TWD'): PriceAtAnalysis =>
  new PriceAtAnalysis(new Decimal(price), currency, new Date('2026-10-16T05:30:00Z'), '證交所')

export const createAnalysisResult = (overrides: { grade?: string, priceAtAnalysis?: PriceAtAnalysis | null, createdAt?: Date } = {}): AnalysisResult =>
  new AnalysisResult(
    overrides.grade ?? 'bullish',
    72,
    'short',
    '營收創新高',
    [new KeyEvent('法說會上修財測', 'https://news.example/1', new Date('2026-10-15T08:00:00Z'))],
    ['匯率波動'],
    [new AnalysisEvidence('法說會上修財測', 'https://news.example/1', new Date('2026-10-15T08:00:00Z'), '鉅亨網')],
    overrides.priceAtAnalysis === null ? undefined : overrides.priceAtAnalysis ?? createPriceAtAnalysis(),
    overrides.createdAt ?? new Date('2026-10-16T02:01:00Z'),
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

export const createSessionGrade = (session: string): SessionGrade =>
  new SessionGrade(session, 'bullish', 70, `${session} 理由`, [new KeyEvent(`${session} 事件`, `https://news.example/${session}`, new Date('2026-10-16T00:00:00Z'))], ['風險'], [], new Date('2026-10-16T01:00:00Z'))

export const createTrackedSymbolGrade = (sessions: string[] = ['preMarket', 'intraday']): TrackedSymbolGrade =>
  new TrackedSymbolGrade('2330', 'twStock', '2026-10-16', 'bullish', 0.85, 70, new Date('2026-10-16T05:00:00Z'), sessions.map(createSessionGrade))
