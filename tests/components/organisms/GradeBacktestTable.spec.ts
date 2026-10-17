import Decimal from 'decimal.js'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GradeBacktestTable from '~/components/organisms/GradeBacktestTable.vue'
import { AnalysisBacktest } from '~/domain/models/entities/analysis-backtest'
import { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'

const analysesOf = (analyses: AnalysisBacktest[]) =>
  new GradeBacktest(0.5, new HitRate(0, 0, undefined), new Map(), new Map(), new Map(), undefined, new Map(), analyses).toDomain().toDto().analyses

describe('GradeBacktestTable', () => {
  it('shows dashes for a not-yet-due analysis and links it to its page', () => {
    const analyses = analysesOf([new AnalysisBacktest(42, '2330', 'twStock', 'bullish', 80, 'short', new Date('2026-10-01T02:00:00Z'), new Decimal('1000'), undefined, undefined, undefined, 'pending')])

    const wrapper = mount(GradeBacktestTable, { props: { analyses } })
    const cells = wrapper.findAll('td').map(cell => cell.text())

    expect(cells.slice(6)).toEqual(['—', '—', '—', '尚未到期'])
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/analysis-events/42')
  })

  it('says when the period has no completed analysis', () => {
    expect(mount(GradeBacktestTable, { props: { analyses: [] } }).text()).toContain('這段期間沒有已完成的分析')
  })
})
