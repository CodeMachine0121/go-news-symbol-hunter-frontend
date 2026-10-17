import type { AnalysisBacktestDto } from '~/domain/models/dto/analysis-backtest-dto'
import type { HitRateDto } from '~/domain/models/dto/hit-rate-dto'
import type { OutcomeCountDto } from '~/domain/models/dto/outcome-count-dto'

export class GradeBacktestDto {
  constructor(
    readonly overall: HitRateDto,
    readonly randomBaselineText: string,
    readonly byCategory: HitRateDto[],
    readonly byGrade: HitRateDto[],
    readonly byConfidenceBand: HitRateDto[],
    readonly outcomeCounts: OutcomeCountDto[],
    readonly neutralAverageChangeRateText: string,
    readonly analyses: AnalysisBacktestDto[],
  ) {}
}
