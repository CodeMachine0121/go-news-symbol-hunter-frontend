import { describe, expect, it } from 'vitest'
import { News } from '~/domain/models/entities/news'
import { SymbolNews } from '~/domain/models/entities/symbol-news'

const createNews = (title: string, publishedAt: string, summary = ''): News =>
  new News(title, `https://news.example/${title}`, new Date(publishedAt), '鉅亨網', summary)

describe('SymbolNewsDomain', () => {
  it('lists news newest first with summary only when present', () => {
    const symbolNews = new SymbolNews('2330', 'twStock', [
      createNews('較舊', '2026-10-14T02:00:00Z', '  '),
      createNews('最新', '2026-10-16T02:00:00Z', '摘要內容'),
    ], []).toDomain().toDto()

    expect(symbolNews.news.map(news => news.title)).toEqual(['最新', '較舊'])
    expect(symbolNews.news[0]).toMatchObject({ link: 'https://news.example/最新', providerName: '鉅亨網', publishedAtText: '2026-10-16 10:00', summary: '摘要內容' })
    expect(symbolNews.news[1]?.summary).toBeUndefined()
    expect(symbolNews.category.label).toBe('台股')
    expect(symbolNews.failedNewsProvidersText).toBeUndefined()
  })

  it.each([
    { failedNewsProviders: ['鉅亨網'], text: '以下新聞來源這次沒有取到：鉅亨網' },
    { failedNewsProviders: ['鉅亨網', 'Google 新聞'], text: '以下新聞來源這次沒有取到：鉅亨網、Google 新聞' },
  ])('mentions the news providers that were not fetched', ({ failedNewsProviders, text }) => {
    expect(new SymbolNews('2330', 'twStock', [], failedNewsProviders).toDomain().toDto().failedNewsProvidersText).toBe(text)
  })
})
