import Decimal from 'decimal.js'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import GradeBacktestTable from '~/components/organisms/GradeBacktestTable.vue'
import { AnalysisBacktest } from '~/domain/models/entities/analysis-backtest'
import { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'

const analysesOf = (analyses: AnalysisBacktest[]) =>
  new GradeBacktest(0.5, new HitRate(0, 0, undefined), new Map(), new Map(), new Map(), undefined, new Map(), analyses, new Map()).toDomain().toDto().analyses

const manualRecord = () => new AnalysisBacktest(12, '2330', 'twStock', 'bullish', 80, 'short', new Date('2026-10-01T02:00:00Z'), new Decimal('1000'), undefined, undefined, undefined, 'pending', 7, 'manual', undefined)

const backgroundRecord = () => new AnalysisBacktest(undefined, '4958', 'twStock', 'neutral', 50, 'short', new Date('2026-10-28T04:31:10Z'), new Decimal('548'), undefined, undefined, undefined, 'pending', 8, 'background', '2026-10-28')

describe('GradeBacktestTable', () => {
  it('shows dashes for a not-yet-due manual record and links it to its analysis event', () => {
    const wrapper = mount(GradeBacktestTable, { props: { analyses: analysesOf([manualRecord()]) } })
    const cells = wrapper.findAll('td').map(cell => cell.text())

    expect(cells[1]).toBe('手動')
    expect(cells[6]).toBe('—')
    expect(cells.slice(8)).toEqual(['—', '—', '—', '尚未到期'])
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/analysis-events/12')
  })

  it('shows a background record with its trading day and no link', () => {
    const wrapper = mount(GradeBacktestTable, { props: { analyses: analysesOf([backgroundRecord()]) } })
    const cells = wrapper.findAll('td').map(cell => cell.text())

    expect(cells[0]).toBe('台股 4958')
    expect(cells[1]).toBe('背景')
    expect(cells[6]).toBe('2026-10-28')
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  it('counts and names the rows as grade records', () => {
    const wrapper = mount(GradeBacktestTable, { props: { analyses: analysesOf([manualRecord(), backgroundRecord()]) } })

    expect(wrapper.text()).toContain('共 2 筆評等紀錄')
    expect(wrapper.findAll('th').map(header => header.text())).toContain('建立時間')
  })

  it('says when the period has no grade records', () => {
    expect(mount(GradeBacktestTable, { props: { analyses: [] } }).text()).toContain('這段期間沒有評等紀錄')
  })
})
