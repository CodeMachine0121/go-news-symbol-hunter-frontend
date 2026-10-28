import { mount } from '@vue/test-utils'
import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'
import AnalysisReportDocument from '~/components/organisms/AnalysisReportDocument.vue'
import { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { KeyEvent } from '~/domain/models/entities/key-event'
import { PriceAtAnalysis } from '~/domain/models/entities/price-at-analysis'
import { createAnalysisEvent, createAnalysisResult } from '../../fixtures/entity-fixtures'

const EXPORTED_AT = new Date('2026-10-28T02:30:00Z')
const COMPLETED_AT = new Date('2026-10-28T01:15:00Z')

const keyEvent = (number: number): KeyEvent => new KeyEvent(`關鍵事件 ${number}`, `https://news.example/key-${number}`, COMPLETED_AT)
const evidence = (number: number): AnalysisEvidence => new AnalysisEvidence(`佐證新聞 ${number}`, `https://news.example/evidence-${number}`, COMPLETED_AT, `新聞來源 ${number}`)

const analysisResult = (overrides: { grade?: string, reason?: string, keyEvents?: KeyEvent[], riskFactors?: string[], evidence?: AnalysisEvidence[], priceAtAnalysis?: PriceAtAnalysis } = {}): AnalysisResult => {
  const base = createAnalysisResult({ createdAt: COMPLETED_AT })
  return new AnalysisResult(
    overrides.grade ?? 'bullish',
    72,
    'short',
    overrides.reason ?? base.reason,
    overrides.keyEvents ?? base.keyEvents,
    overrides.riskFactors ?? base.riskFactors,
    overrides.evidence ?? base.evidence,
    overrides.priceAtAnalysis,
    COMPLETED_AT,
  )
}

const mountReport = (result: AnalysisResult) => mount(AnalysisReportDocument, {
  props: {
    report: createAnalysisEvent({ analysisEventId: 42, symbol: '2330', category: 'twStock', status: 'succeeded', result }).toDomain().toReportDto(EXPORTED_AT),
  },
})

describe('AnalysisReportDocument', () => {
  it('heads the report with the symbol, market category, analysis event and completion time', () => {
    const header = mountReport(analysisResult()).find('header').text()

    for (const fragment of ['標的分析報告', '台股', '2330', '分析事件 #42', '2026-10-28 09:15']) {
      expect(header).toContain(fragment)
    }
  })

  it('states the conclusion with the grade, horizon, confidence and analysis price', () => {
    const wrapper = mountReport(analysisResult({
      reason: '營收創新高\n毛利率回升',
      priceAtAnalysis: new PriceAtAnalysis(new Decimal('1050.5'), 'TWD', new Date('2026-10-28T01:10:00Z'), '證交所'),
    }))
    const text = wrapper.text()

    for (const fragment of ['看多', '短期（兩週內）', '72', '1050.5 TWD', '證交所', '2026-10-28 09:10']) {
      expect(text).toContain(fragment)
    }
    expect(wrapper.find('.analysis-result-report__reason').text()).toBe('營收創新高\n毛利率回升')
  })

  it('shows 未取得 when the analysis price was not obtained', () => {
    expect(mountReport(analysisResult()).text()).toContain('未取得')
  })

  it('lists every key event and risk factor', () => {
    const wrapper = mountReport(analysisResult({ keyEvents: [keyEvent(1), keyEvent(2), keyEvent(3)], riskFactors: ['匯率波動', '需求放緩'] }))

    expect(wrapper.findAll('.key-event-list__item')).toHaveLength(3)
    expect(wrapper.findAll('.risk-factor-list__item').map(item => item.text())).toEqual(['匯率波動', '需求放緩'])
  })

  it.each([
    { case: 'key events', keyEvents: [], riskFactors: ['匯率波動'], title: '關鍵事件', emptyText: '沒有關鍵事件' },
    { case: 'risk factors', keyEvents: [keyEvent(1)], riskFactors: [], title: '風險因子', emptyText: '沒有風險因子' },
  ])('keeps the $case section and says there are none', ({ keyEvents, riskFactors, title, emptyText }) => {
    const wrapper = mountReport(analysisResult({ keyEvents, riskFactors }))

    expect(wrapper.findAll('h2').map(heading => heading.text())).toContain(title)
    expect(wrapper.text()).toContain(emptyText)
  })

  it('prints the full address under every evidence title', () => {
    const allEvidence = Array.from({ length: 12 }, (_, index) => evidence(index + 1))
    const wrapper = mountReport(analysisResult({ evidence: allEvidence }))
    const items = wrapper.findAll('.evidence-list__item')

    expect(wrapper.text()).toContain('本次分析參考的 12 則新聞')
    expect(items).toHaveLength(12)
    items.forEach((item, index) => {
      const number = index + 1
      expect(item.find('a').text()).toBe(`佐證新聞 ${number}`)
      expect(item.find('a').attributes('href')).toBe(`https://news.example/evidence-${number}`)
      expect(item.find('.evidence-list__link').text()).toBe(`https://news.example/evidence-${number}`)
      expect(item.text()).toContain(`新聞來源 ${number}`)
      expect(item.text()).toContain('2026-10-28 09:15')
    })
  })

  it('ends with the export time and the investment disclaimer', () => {
    const footer = mountReport(analysisResult()).find('footer').text()

    expect(footer).toContain('匯出時間 2026-10-28 10:30')
    expect(footer).toContain('本報告僅供資訊參考，不構成任何投資建議')
  })

  it('spells out the grade so it survives black and white printing', () => {
    expect(mountReport(analysisResult({ grade: 'strongBearish' })).text()).toContain('強烈看空')
  })

  it('has no buttons in the report itself', () => {
    expect(mountReport(analysisResult()).findAll('button')).toHaveLength(0)
  })
})
