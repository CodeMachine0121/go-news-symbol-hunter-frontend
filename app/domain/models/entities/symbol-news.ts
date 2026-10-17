import type { News } from '~/domain/models/entities/news'
import { SymbolNewsDomain } from '~/domain/models/domains/symbol-news-domain'

export class SymbolNews {
  constructor(
    readonly symbol: string,
    readonly category: string,
    readonly news: News[],
    readonly failedNewsProviders: string[],
  ) {}

  toDomain(): SymbolNewsDomain {
    return new SymbolNewsDomain(this)
  }
}
