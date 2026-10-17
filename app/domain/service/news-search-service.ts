import type { INewsProxy } from '~/domain/interface/i-news-proxy'
import { SymbolQueryDomain } from '~/domain/models/domains/symbol-query-domain'
import type { SymbolNewsDto } from '~/domain/models/dto/symbol-news-dto'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import type { ApiKeyService } from '~/domain/service/api-key-service'

export class NewsSearchService {
  constructor(
    private readonly newsProxy: INewsProxy,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async searchSymbolNews(symbolQueryDto: SymbolQueryDto): Promise<SymbolNewsDto> {
    const symbolQuery = new SymbolQueryDomain(symbolQueryDto).toRequiredQuery()
    const symbolNews = await this.newsProxy.searchSymbolNews(symbolQuery, this.apiKeyService.requireApiKey())
    return symbolNews.toDomain().toDto()
  }
}
