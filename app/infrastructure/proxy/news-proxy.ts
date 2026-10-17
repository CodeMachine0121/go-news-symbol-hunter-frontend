import type { INewsProxy } from '~/domain/interface/i-news-proxy'
import { News } from '~/domain/models/entities/news'
import { SymbolNews } from '~/domain/models/entities/symbol-news'
import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import type { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'

type SymbolNewsWire = {
  symbol: string
  category: string
  news: { title: string, link: string, publishedAt: string, providerName: string, summary?: string }[] | null
  failedNewsProviders: string[] | null
}

export class NewsProxy implements INewsProxy {
  constructor(private readonly backendHttpProxy: BackendHttpProxy) {}

  async searchSymbolNews(symbolQuery: SymbolQueryVo, apiKey: string): Promise<SymbolNews> {
    const response = await this.backendHttpProxy.request<SymbolNewsWire>('GET', '/news', {
      apiKey,
      query: { symbol: symbolQuery.symbol, category: symbolQuery.category },
    })
    const symbolNews = response.body
    return new SymbolNews(
      symbolNews.symbol,
      symbolNews.category,
      (symbolNews.news ?? []).map(news => new News(news.title, news.link, new Date(news.publishedAt), news.providerName, news.summary ?? '')),
      symbolNews.failedNewsProviders ?? [],
    )
  }
}
