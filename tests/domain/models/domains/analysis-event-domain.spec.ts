import { describe, expect, it } from 'vitest'
import { AnalysisReportUnavailableError } from '~/domain/errors/analysis-report-unavailable-error'
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

describe('AnalysisEventDomain report', () => {
  const exportedAt = new Date('2026-10-28T02:30:00Z')

  it.each([
    { case: 'a completed analysis', status: 'succeeded', result: createAnalysisResult(), isReportExportable: true },
    { case: 'a running analysis', status: 'running', result: undefined, isReportExportable: false },
    { case: 'a failed analysis', status: 'failed', result: undefined, isReportExportable: false },
    { case: 'a completed analysis without a result', status: 'succeeded', result: undefined, isReportExportable: false },
  ])('$case can be exported: $isReportExportable', ({ status, result, isReportExportable }) => {
    expect(createAnalysisEvent({ status, result }).toDomain().toDto(minutesAfterStart(1)).isReportExportable).toBe(isReportExportable)
  })

  it.each([
    { case: 'Taiwan stock', category: 'twStock', symbol: '2330', createdAt: new Date('2026-10-28T01:15:00Z'), fileName: '台股-2330-分析-2026-10-28' },
    { case: 'US stock', category: 'usStock', symbol: 'AAPL', createdAt: new Date('2026-10-27T05:00:00Z'), fileName: '美股-AAPL-分析-2026-10-27' },
    { case: 'completion at 23:59 Taipei time', category: 'crypto', symbol: 'BTC', createdAt: new Date('2026-10-28T15:59:00Z'), fileName: '加密貨幣-BTC-分析-2026-10-28' },
  ])('names the report file for $case', ({ category, symbol, createdAt, fileName }) => {
    const analysisReport = createAnalysisEvent({ category, symbol, status: 'succeeded', result: createAnalysisResult({ createdAt }) }).toDomain().toReportDto(exportedAt)

    expect(analysisReport.fileName).toBe(fileName)
  })

  it('carries the report header, footer and the analysis result', () => {
    const analysisReport = createAnalysisEvent({
      analysisEventId: 42,
      category: 'twStock',
      symbol: '2330',
      status: 'succeeded',
      result: createAnalysisResult({ createdAt: new Date('2026-10-28T01:15:00Z') }),
    }).toDomain().toReportDto(exportedAt)

    expect(analysisReport.analysisEventId).toBe(42)
    expect(analysisReport.symbol).toBe('2330')
    expect(analysisReport.category.label).toBe('台股')
    expect(analysisReport.result.createdAtText).toBe('2026-10-28 09:15')
    expect(analysisReport.result.grade.label).toBe('看多')
    expect(analysisReport.exportedAtText).toBe('2026-10-28 10:30')
    expect(analysisReport.disclaimer).toBe('本報告僅供資訊參考，不構成任何投資建議')
  })

  it.each(['running', 'failed'])('refuses to build a report for a %s analysis', (status) => {
    expect(() => createAnalysisEvent({ status, result: createAnalysisResult() }).toDomain().toReportDto(exportedAt))
      .toThrow(AnalysisReportUnavailableError)
  })
})
