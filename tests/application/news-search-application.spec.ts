import { describe, expect, it } from 'vitest'
import { NewsSearchApplication } from '~/application/news-search-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { News } from '~/domain/models/entities/news'
import { SymbolNews } from '~/domain/models/entities/symbol-news'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { NewsSearchService } from '~/domain/service/news-search-service'
import { mockApiKeyProxy, mockApiKeyStorageProxy, mockNewsProxy } from '../fixtures/proxy-mocks'

const createApplication = (storedApiKey: string | null = 'api-key') => {
  const newsProxy = mockNewsProxy()
  const apiKeyService = new ApiKeyService(mockApiKeyProxy(), mockApiKeyStorageProxy(storedApiKey ?? undefined))
  return { newsProxy, newsSearchApplication: new NewsSearchApplication(new NewsSearchService(newsProxy, apiKeyService), new MarketCategoryService()) }
}

describe('NewsSearchApplication', () => {
  it('lists the market categories to choose from', () => {
    expect(createApplication().newsSearchApplication.listMarketCategories().map(category => category.label)).toEqual(['台股', '美股', '加密貨幣'])
  })

  it('searches the news of a symbol with the current API key', async () => {
    const { newsProxy, newsSearchApplication } = createApplication()
    newsProxy.searchSymbolNews.mockResolvedValue(new SymbolNews('2330', 'twStock', [
      new News('舊聞', 'https://news.example/old', new Date('2026-10-10T00:00:00Z'), '鉅亨網', ''),
      new News('新聞', 'https://news.example/new', new Date('2026-10-16T00:00:00Z'), 'Google 新聞', '摘要'),
    ], []))

    const symbolNews = await newsSearchApplication.searchSymbolNews(new SymbolQueryDto('2330', 'twStock'))

    expect(newsProxy.searchSymbolNews).toHaveBeenCalledWith(expect.objectContaining({ symbol: '2330', category: 'twStock' }), 'api-key')
    expect(symbolNews.news.map(news => news.title)).toEqual(['新聞', '舊聞'])
  })

  it.each([
    { code: 'symbol_not_found', message: '找不到此標的' },
    { code: 'news_providers_unavailable', message: '新聞來源暫時無法使用' },
  ])('passes on 「$message」', async ({ code, message }) => {
    const { newsProxy, newsSearchApplication } = createApplication()
    newsProxy.searchSymbolNews.mockRejectedValue(new BackendRejectionError(code, message))

    await expect(newsSearchApplication.searchSymbolNews(new SymbolQueryDto('9999', 'twStock'))).rejects.toThrow(message)
  })

  it('does not search with a blank symbol', async () => {
    const { newsProxy, newsSearchApplication } = createApplication()

    await expect(newsSearchApplication.searchSymbolNews(new SymbolQueryDto(' ', 'twStock'))).rejects.toThrow(new InvalidInputError('請輸入標的'))
    expect(newsProxy.searchSymbolNews).not.toHaveBeenCalled()
  })

  it('does not search without an API key', async () => {
    const { newsProxy, newsSearchApplication } = createApplication(null)

    const failure = newsSearchApplication.searchSymbolNews(new SymbolQueryDto('2330', 'twStock'))

    const error = await failure.catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(BackendRejectionError)
    expect(error instanceof BackendRejectionError && error.isApiKeyProblem).toBe(true)
    expect(error).toMatchObject({ code: 'api_key_missing', message: '需要提供 API key' })
    expect(newsProxy.searchSymbolNews).not.toHaveBeenCalled()
  })
})
