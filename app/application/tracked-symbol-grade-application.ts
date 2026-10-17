import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import type { TrackedSymbolGradeDto } from '~/domain/models/dto/tracked-symbol-grade-dto'
import type { MarketCategoryService } from '~/domain/service/market-category-service'
import type { TrackedSymbolGradeService } from '~/domain/service/tracked-symbol-grade-service'

export class TrackedSymbolGradeApplication {
  constructor(
    private readonly trackedSymbolGradeService: TrackedSymbolGradeService,
    private readonly marketCategoryService: MarketCategoryService,
  ) {}

  listMarketCategories(): LabelledValueDto[] {
    return this.marketCategoryService.listMarketCategories()
  }

  getTrackedSymbolGrades(symbolQueryDto: SymbolQueryDto): Promise<TrackedSymbolGradeDto[]> {
    return this.trackedSymbolGradeService.getTrackedSymbolGrades(symbolQueryDto)
  }
}
