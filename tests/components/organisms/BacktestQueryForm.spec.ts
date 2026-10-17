import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BacktestQueryForm from '~/components/organisms/BacktestQueryForm.vue'
import { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'
import { MarketCategoryService } from '~/domain/service/market-category-service'

describe('BacktestQueryForm', () => {
  it('asks for the backtest of the chosen period and symbol', async () => {
    const wrapper = mount(BacktestQueryForm, { props: { categories: new MarketCategoryService().listMarketCategories(), loading: false } })
    const inputs = wrapper.findAll('input')

    await inputs[0]?.setValue('2026-10-01')
    await inputs[1]?.setValue('2026-10-31')
    await wrapper.find('select').setValue('twStock')
    await inputs[2]?.setValue('2330')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[new GradeBacktestQueryDto('2026-10-01', '2026-10-31', '2330', 'twStock')]])
  })
})
