import { MARKET_CATEGORIES, MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'
import type { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export class MarketCategoryService {
  listMarketCategories(): LabelledValueDto[] {
    return MARKET_CATEGORIES.map(category => new MarketCategoryDomain(category).toDto())
  }
}
