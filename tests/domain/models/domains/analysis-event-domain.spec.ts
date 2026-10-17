import { describe, expect, it } from 'vitest'
import { STARTED_AT, createAnalysisEvent, createAnalysisResult, createPriceAtAnalysis } from '../../../fixtures/entity-fixtures'

const minutesAfterStart = (minutes: number): Date => new Date(STARTED_AT.getTime() + minutes * 60 * 1000)

describe('AnalysisEventDomain', () => {
  it.each([
    { case: 'running for 1 minute', status: 'running', minutes: 1, value: 'running', label: '分析中', tone: 'info', keepPolling: true, pollingExpired: false },
    { case: 'running exactly 15 minutes', status: 'running', minutes: 15, value: 'running', label: '分析中', tone: 'info', keepPolling: true, pollingExpired: false },
    { case: 'running more than 15 minutes', status: 'running', minutes: 15.01, value: 'running', label: '分析中', tone: 'info', keepPolling: false, pollingExpired: true },
    { case: 'succeeded', status: 'succeeded', minutes: 1, value: 'succeeded', label: '已完成', tone: 'positive', keepPolling: false, pollingExpired: false },
    { case: 'failed', status: 'failed', minutes: 1, value: 'failed', label: '失敗', tone: 'negative', keepPolling: false, pollingExpired: false },
    { case: 'unknown status', status: 'paused', minutes: 1, value: 'failed', label: '失敗', tone: 'negative', keepPolling: false, pollingExpired: false },
  ])('$case → $label, keepPolling $keepPolling', ({ status, minutes, value, label, tone, keepPolling, pollingExpired }) => {
    const analysisEvent = createAnalysisEvent({ status, failureReason: 'AI 服務暫時無法使用' }).toDomain().toDto(minutesAfterStart(minutes))

    expect(analysisEvent.status).toMatchObject({ value, label, tone })
    expect(analysisEvent.keepPolling).toBe(keepPolling)
    expect(analysisEvent.pollingExpired).toBe(pollingExpired)
  })

  it('states the failure reason of a failed analysis', () => {
    const analysisEvent = createAnalysisEvent({ status: 'failed', failureReason: 'AI 服務暫時無法使用' }).toDomain().toDto(minutesAfterStart(1))

    expect(analysisEvent.failureMessage).toBe('分析失敗：AI 服務暫時無法使用')
  })

  it.each(['running', 'succeeded'])('has no failure message while %s', (status) => {
    expect(createAnalysisEvent({ status, failureReason: 'AI 服務暫時無法使用' }).toDomain().toDto(minutesAfterStart(1)).failureMessage).toBeUndefined()
  })

  it('falls back to an unknown reason when the failure reason is missing', () => {
    expect(createAnalysisEvent({ status: 'failed' }).toDomain().toDto(minutesAfterStart(1)).failureMessage).toBe('分析失敗：未知原因')
  })

  it('presents the full result of a completed analysis', () => {
    const result = createAnalysisEvent({ status: 'succeeded', result: createAnalysisResult() }).toDomain().toDto(minutesAfterStart(1)).result

    expect(result?.grade).toMatchObject({ label: '看多', tone: 'positive' })
    expect(result?.confidence).toBe(72)
    expect(result?.timeHorizon.label).toBe('短期（兩週內）')
    expect(result?.reason).toBe('營收創新高')
    expect(result?.keyEvents).toEqual([expect.objectContaining({ title: '法說會上修財測', link: 'https://news.example/1' })])
    expect(result?.riskFactors).toEqual(['匯率波動'])
    expect(result?.evidence).toEqual([expect.objectContaining({ title: '法說會上修財測', providerName: '鉅亨網' })])
  })

  it.each([
    { case: 'TWSE close price', price: createPriceAtAnalysis('1085.5', 'TWD'), priceText: '1085.5 TWD', sourceText: '證交所', pricedAtText: '2026-10-16 13:30' },
    { case: 'tiny crypto price', price: createPriceAtAnalysis('0.00001234', 'USDT'), priceText: '0.00001234 USDT', sourceText: '證交所', pricedAtText: '2026-10-16 13:30' },
    { case: 'even tinier price', price: createPriceAtAnalysis('0.000000001', 'USDT'), priceText: '0.000000001 USDT', sourceText: '證交所', pricedAtText: '2026-10-16 13:30' },
    { case: 'price not obtained', price: null, priceText: '未取得', sourceText: '未取得', pricedAtText: '未取得' },
  ])('shows the analysis price for $case', ({ price, priceText, sourceText, pricedAtText }) => {
    const result = createAnalysisEvent({ status: 'succeeded', result: createAnalysisResult({ priceAtAnalysis: price }) }).toDomain().toDto(minutesAfterStart(1)).result

    expect(result?.priceAtAnalysis).toMatchObject({ priceText, sourceText, pricedAtText })
    expect(result?.grade.label).toBe('看多')
  })

  it('shows no result while the analysis is still running', () => {
    expect(createAnalysisEvent({ status: 'running', result: createAnalysisResult() }).toDomain().toDto(minutesAfterStart(1)).result).toBeUndefined()
  })
})
