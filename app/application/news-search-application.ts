import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import type { SymbolNewsDto } from '~/domain/models/dto/symbol-news-dto'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import type { MarketCategoryService } from '~/domain/service/market-category-service'
import type { NewsSearchService } from '~/domain/service/news-search-service'

export class NewsSearchApplication {
  constructor(
    private readonly newsSearchService: NewsSearchService,
    private readonly marketCategoryService: MarketCategoryService,
  ) {}

  listMarketCategories(): LabelledValueDto[] {
    return this.marketCategoryService.listMarketCategories()
  }

  searchSymbolNews(symbolQueryDto: SymbolQueryDto): Promise<SymbolNewsDto> {
    return this.newsSearchService.searchSymbolNews(symbolQueryDto)
  }
}
