import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GradeBacktestSummary from '~/components/organisms/GradeBacktestSummary.vue'
import { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'

describe('GradeBacktestSummary', () => {
  it('shows the overall hit rate next to random and 沒有資料 for empty groups', () => {
    const gradeBacktest = new GradeBacktest(0.5, new HitRate(26, 14, 0.65), new Map(), new Map(), new Map([['high', new HitRate(0, 0, undefined)]]), undefined, new Map(), []).toDomain().toDto()

    const wrapper = mount(GradeBacktestSummary, { props: { gradeBacktest } })
    const highRow = wrapper.findAll('tr').find(row => row.text().includes('高信心'))

    expect(wrapper.text()).toContain('整體命中率65%')
    expect(wrapper.text()).toContain('隨機 50%')
    expect(highRow?.findAll('td')[1]?.text()).toBe('沒有資料')
  })
})
