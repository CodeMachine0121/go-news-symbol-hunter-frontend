import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SymbolAnalysisApplication } from '~/application/symbol-analysis-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { StartedSymbolAnalysis } from '~/domain/models/entities/started-symbol-analysis'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { SymbolAnalysisService } from '~/domain/service/symbol-analysis-service'
import { STARTED_AT, createAnalysisEvent, createAnalysisResult } from '../fixtures/entity-fixtures'
import { mockAnalysisEventProxy, mockApiKeyProxy, mockApiKeyStorageProxy, mockRecentAnalysisStorageProxy } from '../fixtures/proxy-mocks'

const createApplication = () => {
  const analysisEventProxy = mockAnalysisEventProxy()
  const recentAnalysisStorageProxy = mockRecentAnalysisStorageProxy()
  const apiKeyService = new ApiKeyService(mockApiKeyProxy(), mockApiKeyStorageProxy('api-key'))
  return {
    analysisEventProxy,
    recentAnalysisStorageProxy,
    symbolAnalysisApplication: new SymbolAnalysisApplication(
      new SymbolAnalysisService(analysisEventProxy, recentAnalysisStorageProxy, apiKeyService),
      new MarketCategoryService(),
    ),
  }
}

describe('SymbolAnalysisApplication', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(STARTED_AT.getTime() + 60 * 1000))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists the market categories to choose from', () => {
    expect(createApplication().symbolAnalysisApplication.listMarketCategories()).toHaveLength(3)
  })

  it.each([
    { case: 'a new analysis', isNew: true, status: 'running', label: '分析中', keepPolling: true, hasResult: false },
    { case: 'a reused completed analysis', isNew: false, status: 'succeeded', label: '已完成', keepPolling: false, hasResult: true },
    { case: 'a reused running analysis', isNew: false, status: 'running', label: '分析中', keepPolling: true, hasResult: false },
  ])('starts $case', async ({ isNew, status, label, keepPolling, hasResult }) => {
    const { analysisEventProxy, symbolAnalysisApplication } = createApplication()
    analysisEventProxy.startSymbolAnalysis.mockResolvedValue(new StartedSymbolAnalysis(isNew, createAnalysisEvent({ analysisEventId: 9, status, result: createAnalysisResult() })))

    const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(new SymbolQueryDto('BTC', 'crypto'))

    expect(analysisEventProxy.startSymbolAnalysis).toHaveBeenCalledWith(expect.objectContaining({ symbol: 'BTC', category: 'crypto' }), 'api-key')
    expect(startedSymbolAnalysis.isNew).toBe(isNew)
    expect(startedSymbolAnalysis.analysisEvent).toMatchObject({ analysisEventId: 9, keepPolling, status: { label } })
    expect(startedSymbolAnalysis.analysisEvent.result !== undefined).toBe(hasResult)
  })

  it('remembers every started analysis, newest first and without duplicates', async () => {
    const { analysisEventProxy, symbolAnalysisApplication } = createApplication()
    for (const analysisEventId of [1, 2, 3, 2]) {
      analysisEventProxy.startSymbolAnalysis.mockResolvedValueOnce(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId })))
      await symbolAnalysisApplication.startSymbolAnalysis(new SymbolQueryDto('BTC', 'crypto'))
    }

    expect(symbolAnalysisApplication.getRecentAnalyses().map(recentAnalysis => recentAnalysis.analysisEventId)).toEqual([2, 3, 1])
  })

  it.each([
    { case: 'with the name the backend answered', symbolName: '台積電', symbolLabel: '2330 台積電' },
    { case: 'without a name', symbolName: '', symbolLabel: '2330' },
  ])('remembers a started analysis $case', async ({ symbolName, symbolLabel }) => {
    const { analysisEventProxy, symbolAnalysisApplication } = createApplication()
    analysisEventProxy.startSymbolAnalysis.mockResolvedValueOnce(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId: 1, symbol: '2330', symbolName, category: 'twStock' })))

    await symbolAnalysisApplication.startSymbolAnalysis(new SymbolQueryDto('2330', 'twStock'))

    expect(symbolAnalysisApplication.getRecentAnalyses()[0]).toMatchObject({ symbol: '2330', symbolLabel, category: { label: '台股' } })
  })

  it.each([
    { case: 'a Taiwan stock by name', typedText: '台積電', category: 'twStock', symbol: '2330', symbolName: '台積電', symbolLabel: '2330 台積電', categoryLabel: '台股' },
    { case: 'a US stock by name', typedText: 'Tesla', category: 'usStock', symbol: 'TSLA', symbolName: 'Tesla, Inc.', symbolLabel: 'TSLA Tesla, Inc.', categoryLabel: '美股' },
    { case: 'a US stock while the US directory is unavailable', typedText: 'Tesla', category: 'usStock', symbol: 'TESLA', symbolName: '', symbolLabel: 'TESLA', categoryLabel: '美股' },
  ])('remembers the symbol the backend resolved for $case', async ({ typedText, category, symbol, symbolName, symbolLabel, categoryLabel }) => {
    const { analysisEventProxy, symbolAnalysisApplication } = createApplication()
    analysisEventProxy.startSymbolAnalysis.mockResolvedValueOnce(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId: 4, symbol, symbolName, category })))

    const startedSymbolAnalysis = await symbolAnalysisApplication.startSymbolAnalysis(new SymbolQueryDto(typedText, category))

    expect(startedSymbolAnalysis.analysisEvent.analysisEventId).toBe(4)
    expect(symbolAnalysisApplication.getRecentAnalyses()[0]).toMatchObject({ analysisEventId: 4, symbol, symbolLabel, category: { label: categoryLabel } })
  })

  it('passes on the capacity limit and remembers nothing', async () => {
    const { analysisEventProxy, recentAnalysisStorageProxy, symbolAnalysisApplication } = createApplication()
    analysisEventProxy.startSymbolAnalysis.mockRejectedValue(new BackendRejectionError('analysis_capacity_reached', '目前分析數量已達上限，請稍後再試'))

    await expect(symbolAnalysisApplication.startSymbolAnalysis(new SymbolQueryDto('BTC', 'crypto'))).rejects.toThrow('目前分析數量已達上限，請稍後再試')
    expect(recentAnalysisStorageProxy.save).not.toHaveBeenCalled()
  })

  it('reads the latest state of an analysis event', async () => {
    const { analysisEventProxy, symbolAnalysisApplication } = createApplication()
    analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ status: 'failed', failureReason: 'AI 服務暫時無法使用' }))

    const analysisEvent = await symbolAnalysisApplication.getAnalysisEvent(7)

    expect(analysisEventProxy.getAnalysisEvent).toHaveBeenCalledWith(7, 'api-key')
    expect(analysisEvent.failureMessage).toBe('分析失敗：AI 服務暫時無法使用')
  })

  it('passes on an unknown analysis event', async () => {
    const { analysisEventProxy, symbolAnalysisApplication } = createApplication()
    analysisEventProxy.getAnalysisEvent.mockRejectedValue(new BackendRejectionError('analysis_event_not_found', '找不到此分析事件'))

    await expect(symbolAnalysisApplication.getAnalysisEvent(404)).rejects.toThrow('找不到此分析事件')
  })
})
