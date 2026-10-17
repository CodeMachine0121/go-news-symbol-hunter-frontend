import type { GradeBacktestDto } from '~/domain/models/dto/grade-backtest-dto'
import type { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { GradeBacktestService } from '~/domain/service/grade-backtest-service'
import type { MarketCategoryService } from '~/domain/service/market-category-service'

export class GradeBacktestApplication {
  constructor(
    private readonly gradeBacktestService: GradeBacktestService,
    private readonly marketCategoryService: MarketCategoryService,
  ) {}

  listMarketCategories(): LabelledValueDto[] {
    return this.marketCategoryService.listMarketCategories()
  }

  getGradeBacktest(gradeBacktestQueryDto: GradeBacktestQueryDto): Promise<GradeBacktestDto> {
    return this.gradeBacktestService.getGradeBacktest(gradeBacktestQueryDto)
  }
}
