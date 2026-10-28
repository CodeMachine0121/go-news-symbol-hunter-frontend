import { AnalysisBacktestDto } from '~/domain/models/dto/analysis-backtest-dto'
import { GradeBacktestDto } from '~/domain/models/dto/grade-backtest-dto'
import { HitRateDto } from '~/domain/models/dto/hit-rate-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import { OutcomeCountDto } from '~/domain/models/dto/outcome-count-dto'
import type { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'
import { BACKTEST_OUTCOMES, BacktestOutcomeDomain } from '~/domain/models/domains/backtest-outcome-domain'
import { CONFIDENCE_BANDS, ConfidenceBandDomain } from '~/domain/models/domains/confidence-band-domain'
import { GRADES, GradeDomain } from '~/domain/models/domains/grade-domain'
import { GRADE_SOURCES, GradeSourceDomain } from '~/domain/models/domains/grade-source-domain'
import { MARKET_CATEGORIES, MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import { TimeHorizonDomain } from '~/domain/models/domains/time-horizon-domain'
import { RatioDomain } from '~/domain/models/domains/ratio-domain'
import { TimestampDomain } from '~/domain/models/domains/timestamp-domain'

const NOT_AVAILABLE = '—'
const NO_DATA = '沒有資料'
const OVERALL = new LabelledValueDto('overall', '整體')
const EMPTY_HIT_RATE = new HitRate(0, 0, undefined)

export class GradeBacktestDomain {
  constructor(private readonly gradeBacktest: GradeBacktest) {}

  toDto(): GradeBacktestDto {
    const toHitRateDto = (group: LabelledValueDto, hitRate: HitRate): HitRateDto => new HitRateDto(
      group,
      hitRate.hitCount,
      hitRate.missCount,
      hitRate.hitRate === undefined ? NO_DATA : new RatioDomain(hitRate.hitRate).toRoundedPercentText(),
    )
    const toGroupDtos = (groups: Map<string, HitRate>, order: string[], toLabel: (key: string) => LabelledValueDto) =>
      order.map(key => toHitRateDto(toLabel(key), groups.get(key) ?? EMPTY_HIT_RATE))
    const neutralAverageChangeRate = this.gradeBacktest.neutralAverageChangeRate
    return new GradeBacktestDto(
      toHitRateDto(OVERALL, this.gradeBacktest.overall),
      `隨機 ${new RatioDomain(this.gradeBacktest.randomBaseline).toRoundedPercentText()}`,
      toGroupDtos(this.gradeBacktest.byCategory, MARKET_CATEGORIES, category => new MarketCategoryDomain(category).toDto()),
      toGroupDtos(this.gradeBacktest.byGrade, GRADES, grade => new GradeDomain(grade).toDto()),
      toGroupDtos(this.gradeBacktest.byConfidenceBand, CONFIDENCE_BANDS, band => new ConfidenceBandDomain(band).toDto()),
      BACKTEST_OUTCOMES.map(outcome => new OutcomeCountDto(new BacktestOutcomeDomain(outcome).toDto(), this.gradeBacktest.outcomeCounts.get(outcome) ?? 0)),
      neutralAverageChangeRate === undefined ? NOT_AVAILABLE : new RatioDomain(neutralAverageChangeRate).toExactSignedPercentText(),
      this.gradeBacktest.analyses.map(analysis => new AnalysisBacktestDto(
        analysis.analysisEventId,
        analysis.symbol,
        new MarketCategoryDomain(analysis.category).toDto(),
        new GradeDomain(analysis.grade).toDto(),
        analysis.confidence,
        new TimeHorizonDomain(analysis.timeHorizon).toDto(),
        new TimestampDomain(analysis.completedAt).toDateTimeText(),
        analysis.entryPrice?.toFixed() ?? NOT_AVAILABLE,
        analysis.checkpointDate ?? NOT_AVAILABLE,
        analysis.checkpointPrice?.toFixed() ?? NOT_AVAILABLE,
        analysis.priceChangeRate === undefined ? NOT_AVAILABLE : new RatioDomain(analysis.priceChangeRate).toExactSignedPercentText(),
        new BacktestOutcomeDomain(analysis.outcome).toDto(),
        analysis.gradeRecordId,
        new GradeSourceDomain(analysis.source).toDto(),
        analysis.tradingDay ?? NOT_AVAILABLE,
        analysis.analysisEventId !== undefined,
      )),
      toGroupDtos(this.gradeBacktest.bySource, GRADE_SOURCES, source => new GradeSourceDomain(source).toDto()),
    )
  }
}

