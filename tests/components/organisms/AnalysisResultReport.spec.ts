import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AnalysisResultReport from '~/components/organisms/AnalysisResultReport.vue'
import type { AnalysisResult } from '~/domain/models/entities/analysis-result'
import { STARTED_AT, createAnalysisEvent, createAnalysisResult, createPriceAtAnalysis } from '../../fixtures/entity-fixtures'

const resultOf = (result: AnalysisResult) => {
  const analysisResult = createAnalysisEvent({ status: 'succeeded', result }).toDomain().toDto(STARTED_AT).result
  if (!analysisResult) {
    throw new Error('expected a result')
  }
  return analysisResult
}

describe('AnalysisResultReport', () => {
  it('presents the grade, confidence, horizon, reason, key events, risk factors and evidence', () => {
    const wrapper = mount(AnalysisResultReport, { props: { result: resultOf(createAnalysisResult()) } })
    const text = wrapper.text()

    expect(text).toContain('看多')
    expect(text).toContain('72')
    expect(text).toContain('短期（兩週內）')
    expect(text).toContain('營收創新高')
    expect(text).toContain('匯率波動')
    expect(text).toContain('鉅亨網')
    expect(wrapper.findAll('a').map(link => link.attributes('href'))).toEqual(['https://news.example/1', 'https://news.example/1'])
  })

  it.each([
    { case: 'a known price', price: createPriceAtAnalysis('1085.5', 'TWD'), expected: ['1085.5 TWD', '證交所', '2026-10-16'] },
    { case: 'a tiny price', price: createPriceAtAnalysis('0.00001234', 'USDT'), expected: ['0.00001234 USDT'] },
    { case: 'no price', price: null, expected: ['未取得', '營收創新高'] },
  ])('shows $case', ({ price, expected }) => {
    const text = mount(AnalysisResultReport, { props: { result: resultOf(createAnalysisResult({ priceAtAnalysis: price })) } }).text()

    for (const fragment of expected) {
      expect(text).toContain(fragment)
    }
  })

  it('says when there are no key events or risk factors', () => {
    const empty = createAnalysisResult({ keyEvents: [], riskFactors: [], evidence: [] })

    const text = mount(AnalysisResultReport, { props: { result: resultOf(empty) } }).text()

    expect(text).toContain('沒有關鍵事件')
    expect(text).toContain('沒有風險因子')
  })
})
