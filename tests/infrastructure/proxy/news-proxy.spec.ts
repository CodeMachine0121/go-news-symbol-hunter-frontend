import { afterEach, describe, expect, it, vi } from 'vitest'
import { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { NewsProxy } from '~/infrastructure/proxy/news-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

describe('NewsProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the news of a symbol', async () => {
    const fetchStub = stubFetch(jsonResponse(200, {
      symbol: '2330',
      category: 'twStock',
      news: [{ title: '新聞', link: 'https://news.example/1', publishedAt: '2026-10-16T02:00:00Z', providerName: '鉅亨網' }],
      failedNewsProviders: ['Google 新聞'],
    }))

    const symbolNews = await new NewsProxy(new BackendHttpProxy('http://backend.test')).searchSymbolNews(new SymbolQueryVo('2330', 'twStock'), 'key')

    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/news?symbol=2330&category=twStock', method: 'GET', apiKey: 'key' })
    expect(symbolNews.news[0]).toMatchObject({ title: '新聞', summary: '', publishedAt: new Date('2026-10-16T02:00:00Z') })
    expect(symbolNews.failedNewsProviders).toEqual(['Google 新聞'])
  })

  it('treats missing lists as empty', async () => {
    stubFetch(jsonResponse(200, { symbol: '2330', category: 'twStock', news: null, failedNewsProviders: null }))

    const symbolNews = await new NewsProxy(new BackendHttpProxy('http://backend.test')).searchSymbolNews(new SymbolQueryVo('2330', 'twStock'), 'key')

    expect(symbolNews.news).toEqual([])
    expect(symbolNews.failedNewsProviders).toEqual([])
  })
})
