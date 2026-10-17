import type { SymbolNews } from '~/domain/models/entities/symbol-news'
import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'

export interface INewsProxy {
  searchSymbolNews(symbolQuery: SymbolQueryVo, apiKey: string): Promise<SymbolNews>
}
