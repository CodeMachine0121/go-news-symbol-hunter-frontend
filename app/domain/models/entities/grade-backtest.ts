import type Decimal from 'decimal.js'
import type { AnalysisBacktest } from '~/domain/models/entities/analysis-backtest'
import type { HitRate } from '~/domain/models/entities/hit-rate'
import { GradeBacktestDomain } from '~/domain/models/domains/grade-backtest-domain'

export class GradeBacktest {
  constructor(
    readonly randomBaseline: number,
    readonly overall: HitRate,
    readonly byCategory: Map<string, HitRate>,
    readonly byGrade: Map<string, HitRate>,
    readonly byConfidenceBand: Map<string, HitRate>,
    readonly neutralAverageChangeRate: Decimal | undefined,
    readonly outcomeCounts: Map<string, number>,
    readonly analyses: AnalysisBacktest[],
  ) {}

  toDomain(): GradeBacktestDomain {
    return new GradeBacktestDomain(this)
  }
}
