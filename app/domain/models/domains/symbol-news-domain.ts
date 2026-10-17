import { SymbolNewsDto } from '~/domain/models/dto/symbol-news-dto'
import type { SymbolNews } from '~/domain/models/entities/symbol-news'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'

export class SymbolNewsDomain {
  constructor(private readonly symbolNews: SymbolNews) {}

  toDto(): SymbolNewsDto {
    const newestFirst = [...this.symbolNews.news].sort((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime())
    const failedNewsProviders = this.symbolNews.failedNewsProviders
    return new SymbolNewsDto(
      this.symbolNews.symbol,
      new MarketCategoryDomain(this.symbolNews.category).toDto(),
      newestFirst.map(news => news.toDto()),
      failedNewsProviders.length === 0 ? undefined : `以下新聞來源這次沒有取到：${failedNewsProviders.join('、')}`,
    )
  }
}
