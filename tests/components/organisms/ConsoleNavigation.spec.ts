import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsoleNavigation from '~/components/organisms/ConsoleNavigation.vue'

describe('ConsoleNavigation', () => {
  it('links to every page of the console', () => {
    const links = mount(ConsoleNavigation).findAllComponents(RouterLinkStub)

    expect(links.map(link => [link.text(), link.props('to')])).toEqual([
      ['標的分析', '/analysis-events'],
      ['新聞搜尋', '/news'],
      ['追蹤標的評等', '/tracked-symbol-grades'],
      ['評等回測', '/grade-backtest'],
      ['API key', '/api-key'],
    ])
  })
})
