import Decimal from 'decimal.js'
import type { IGradeBacktestProxy } from '~/domain/interface/i-grade-backtest-proxy'
import { AnalysisBacktest } from '~/domain/models/entities/analysis-backtest'
import { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'
import type { GradeBacktestQueryVo } from '~/domain/models/vo/grade-backtest-query-vo'
import type { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'

type HitRateWire = {
  hitCount: number
  missCount: number
  hitRate: number | null
}

type GradeBacktestWire = {
  randomBaseline: number
  overall: HitRateWire
  byCategory: Record<string, HitRateWire> | null
  byGrade: Record<string, HitRateWire> | null
  byConfidenceBand: Record<string, HitRateWire> | null
  bySource: Record<string, HitRateWire> | null
  neutralAverageChangeRate: string | null
  outcomeCounts: Record<string, number> | null
  analyses: {
    gradeRecordId: number
    source: string
    analysisEventId: number | null
    tradingDay: string | null
    symbol: string
    category: string
    grade: string
    confidence: number
    timeHorizon: string
    completedAt: string
    entryPrice: string | null
    checkpointDate: string | null
    checkpointPrice: string | null
    priceChangeRate: string | null
    outcome: string
  }[] | null
}

const toHitRate = (hitRate: HitRateWire): HitRate => new HitRate(hitRate.hitCount, hitRate.missCount, hitRate.hitRate ?? undefined)

const toHitRates = (hitRates: Record<string, HitRateWire> | null): Map<string, HitRate> =>
  new Map(Object.entries(hitRates ?? {}).map(([key, hitRate]) => [key, toHitRate(hitRate)]))

const toDecimal = (value: string | null): Decimal | undefined => value === null ? undefined : new Decimal(value)

export class GradeBacktestProxy implements IGradeBacktestProxy {
  constructor(private readonly backendHttpProxy: BackendHttpProxy) {}

  async getGradeBacktest(gradeBacktestQuery: GradeBacktestQueryVo, apiKey: string): Promise<GradeBacktest> {
    const response = await this.backendHttpProxy.request<GradeBacktestWire>('GET', '/grade-backtest', {
      apiKey,
      query: {
        completedFrom: gradeBacktestQuery.completedFrom,
        completedTo: gradeBacktestQuery.completedTo,
        symbol: gradeBacktestQuery.symbolQuery?.symbol,
        category: gradeBacktestQuery.symbolQuery?.category,
        source: gradeBacktestQuery.source,
      },
    })
    const gradeBacktest = response.body
    return new GradeBacktest(
      gradeBacktest.randomBaseline,
      toHitRate(gradeBacktest.overall),
      toHitRates(gradeBacktest.byCategory),
      toHitRates(gradeBacktest.byGrade),
      toHitRates(gradeBacktest.byConfidenceBand),
      toDecimal(gradeBacktest.neutralAverageChangeRate),
      new Map(Object.entries(gradeBacktest.outcomeCounts ?? {})),
      (gradeBacktest.analyses ?? []).map(analysis => new AnalysisBacktest(
        analysis.analysisEventId ?? undefined,
        analysis.symbol,
        analysis.category,
        analysis.grade,
        analysis.confidence,
        analysis.timeHorizon,
        new Date(analysis.completedAt),
        toDecimal(analysis.entryPrice),
        analysis.checkpointDate ?? undefined,
        toDecimal(analysis.checkpointPrice),
        toDecimal(analysis.priceChangeRate),
        analysis.outcome,
        analysis.gradeRecordId,
        analysis.source,
        analysis.tradingDay ?? undefined,
      )),
      toHitRates(gradeBacktest.bySource),
    )
  }
}
