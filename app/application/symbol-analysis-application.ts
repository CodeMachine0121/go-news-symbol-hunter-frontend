import type { AnalysisEventDto } from '~/domain/models/dto/analysis-event-dto'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { RecentAnalysisDto } from '~/domain/models/dto/recent-analysis-dto'
import type { StartedSymbolAnalysisDto } from '~/domain/models/dto/started-symbol-analysis-dto'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import type { MarketCategoryService } from '~/domain/service/market-category-service'
import type { SymbolAnalysisService } from '~/domain/service/symbol-analysis-service'

export class SymbolAnalysisApplication {
  constructor(
    private readonly symbolAnalysisService: SymbolAnalysisService,
    private readonly marketCategoryService: MarketCategoryService,
  ) {}

  listMarketCategories(): LabelledValueDto[] {
    return this.marketCategoryService.listMarketCategories()
  }

  startSymbolAnalysis(symbolQueryDto: SymbolQueryDto): Promise<StartedSymbolAnalysisDto> {
    return this.symbolAnalysisService.startSymbolAnalysis(symbolQueryDto)
  }

  getAnalysisEvent(analysisEventId: number): Promise<AnalysisEventDto> {
    return this.symbolAnalysisService.getAnalysisEvent(analysisEventId)
  }

  getRecentAnalyses(): RecentAnalysisDto[] {
    return this.symbolAnalysisService.getRecentAnalyses()
  }
}
