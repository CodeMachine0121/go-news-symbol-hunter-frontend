import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BacktestQueryForm from '~/components/organisms/BacktestQueryForm.vue'
import { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'
import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'
import { MarketCategoryService } from '~/domain/service/market-category-service'

const sources = [new LabelledValueDto('manual', '手動'), new LabelledValueDto('background', '背景')]

const mountForm = () => mount(BacktestQueryForm, { props: { categories: new MarketCategoryService().listMarketCategories(), sources, loading: false } })

describe('BacktestQueryForm', () => {
  it('asks for the backtest of the chosen period and symbol', async () => {
    const wrapper = mountForm()
    const inputs = wrapper.findAll('input')

    await inputs[0]?.setValue('2026-10-01')
    await inputs[1]?.setValue('2026-10-31')
    await wrapper.findAll('select')[0]?.setValue('twStock')
    await inputs[2]?.setValue('2330')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[new GradeBacktestQueryDto('2026-10-01', '2026-10-31', '2330', 'twStock', '')]])
  })

  it('asks for only the chosen grade source', async () => {
    const wrapper = mountForm()

    await wrapper.findAll('select')[1]?.setValue('background')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[new GradeBacktestQueryDto('', '', '', '', 'background')]])
  })

  it('offers every grade source after 全部', () => {
    const options = mountForm().findAll('select')[1]?.findAll('option').map(option => option.text())

    expect(options).toEqual(['全部', '手動', '背景'])
  })
})
