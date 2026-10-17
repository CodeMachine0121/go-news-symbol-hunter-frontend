import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NewsResultList from '~/components/organisms/NewsResultList.vue'
import { News } from '~/domain/models/entities/news'
import { SymbolNews } from '~/domain/models/entities/symbol-news'

const mountList = (news: News[], failedNewsProviders: string[] = []) => mount(NewsResultList, {
  props: { symbolNews: new SymbolNews('2330', 'twStock', news, failedNewsProviders).toDomain().toDto() },
})

describe('NewsResultList', () => {
  it('lists each news item with a link, provider, time and summary when present', () => {
    const wrapper = mountList([
      new News('舊聞', 'https://news.example/old', new Date('2026-10-14T02:00:00Z'), 'Google 新聞', ''),
      new News('新聞', 'https://news.example/new', new Date('2026-10-16T02:00:00Z'), '鉅亨網', '摘要內容'),
    ])
    const items = wrapper.findAll('article')

    expect(items.map(item => item.find('a').text())).toEqual(['新聞', '舊聞'])
    expect(items[0]?.find('a').attributes('href')).toBe('https://news.example/new')
    expect(items[0]?.text()).toContain('鉅亨網')
    expect(items[0]?.text()).toContain('2026-10-16 10:00')
    expect(items[0]?.text()).toContain('摘要內容')
    expect(items[1]?.findAll('p')).toHaveLength(1)
  })

  it('mentions the news providers that were not fetched next to the news', () => {
    const wrapper = mountList([new News('新聞', 'https://news.example/new', new Date('2026-10-16T02:00:00Z'), 'Google 新聞', '')], ['鉅亨網'])

    expect(wrapper.text()).toContain('以下新聞來源這次沒有取到：鉅亨網')
    expect(wrapper.findAll('article')).toHaveLength(1)
  })

  it('says there is no news in the last 7 days', () => {
    expect(mountList([]).text()).toContain('近 7 天沒有新聞')
  })
})
