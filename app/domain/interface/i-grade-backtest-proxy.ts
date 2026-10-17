import type { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import type { GradeBacktestQueryVo } from '~/domain/models/vo/grade-backtest-query-vo'

export interface IGradeBacktestProxy {
  getGradeBacktest(gradeBacktestQuery: GradeBacktestQueryVo, apiKey: string): Promise<GradeBacktest>
}
