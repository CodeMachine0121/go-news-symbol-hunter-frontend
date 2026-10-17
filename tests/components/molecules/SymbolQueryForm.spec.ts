import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SymbolQueryForm from '~/components/molecules/SymbolQueryForm.vue'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { MarketCategoryService } from '~/domain/service/market-category-service'

const categories = new MarketCategoryService().listMarketCategories()

describe('SymbolQueryForm', () => {
  it('asks to search with the first market category by default', async () => {
    const wrapper = mount(SymbolQueryForm, { props: { categories, submitLabel: '搜尋' } })

    await wrapper.find('input').setValue('2330')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[new SymbolQueryDto('2330', 'twStock')]])
  })

  it('lets an optional query leave both fields empty or pick a market category', async () => {
    const wrapper = mount(SymbolQueryForm, { props: { categories, submitLabel: '查詢', optional: true } })

    await wrapper.find('form').trigger('submit')
    await wrapper.find('select').setValue('crypto')
    await wrapper.find('input').setValue('BTC')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('option').text()).toBe('全部')
    expect(wrapper.emitted('submit')).toEqual([[new SymbolQueryDto('', '')], [new SymbolQueryDto('BTC', 'crypto')]])
  })

  it('falls back to no market category when none are offered', async () => {
    const wrapper = mount(SymbolQueryForm, { props: { categories: [], submitLabel: '搜尋' } })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[new SymbolQueryDto('', '')]])
  })
})
