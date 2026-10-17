import { describe, expect, it } from 'vitest'
import { GradeBacktestApplication } from '~/application/grade-backtest-application'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { GradeBacktestQueryDto } from '~/domain/models/dto/grade-backtest-query-dto'
import { GradeBacktest } from '~/domain/models/entities/grade-backtest'
import { HitRate } from '~/domain/models/entities/hit-rate'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { GradeBacktestService } from '~/domain/service/grade-backtest-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { mockApiKeyProxy, mockApiKeyStorageProxy, mockGradeBacktestProxy } from '../fixtures/proxy-mocks'

const createApplication = () => {
  const gradeBacktestProxy = mockGradeBacktestProxy()
  const apiKeyService = new ApiKeyService(mockApiKeyProxy(), mockApiKeyStorageProxy('api-key'))
  return {
    gradeBacktestProxy,
    gradeBacktestApplication: new GradeBacktestApplication(new GradeBacktestService(gradeBacktestProxy, apiKeyService), new MarketCategoryService()),
  }
}

describe('GradeBacktestApplication', () => {
  it('lists the market categories to choose from', () => {
    expect(createApplication().gradeBacktestApplication.listMarketCategories()).toHaveLength(3)
  })

  it('queries the backtest for a period and a symbol', async () => {
    const { gradeBacktestProxy, gradeBacktestApplication } = createApplication()
    gradeBacktestProxy.getGradeBacktest.mockResolvedValue(new GradeBacktest(0.5, new HitRate(26, 14, 0.65), new Map(), new Map(), new Map(), undefined, new Map(), []))

    const gradeBacktest = await gradeBacktestApplication.getGradeBacktest(new GradeBacktestQueryDto('2026-10-01', '2026-10-31', '2330', 'twStock'))

    expect(gradeBacktestProxy.getGradeBacktest).toHaveBeenCalledWith(
      expect.objectContaining({ completedFrom: '2026-10-01', completedTo: '2026-10-31', symbolQuery: expect.objectContaining({ symbol: '2330', category: 'twStock' }) }),
      'api-key',
    )
    expect(gradeBacktest.overall.hitRateText).toBe('65%')
    expect(gradeBacktest.randomBaselineText).toBe('隨機 50%')
  })

  it.each([
    { query: new GradeBacktestQueryDto('2026-10-10', '2026-10-01', '', ''), message: '期間不正確' },
    { query: new GradeBacktestQueryDto('', '', '2330', ''), message: '標的與市場類別需一起提供' },
  ])('does not query when $message', async ({ query, message }) => {
    const { gradeBacktestProxy, gradeBacktestApplication } = createApplication()

    await expect(gradeBacktestApplication.getGradeBacktest(query)).rejects.toThrow(new InvalidInputError(message))
    expect(gradeBacktestProxy.getGradeBacktest).not.toHaveBeenCalled()
  })

  it.each([
    { code: 'backtest_analysis_limit_exceeded', message: '涵蓋分析超過 500 筆，請縮小期間' },
    { code: 'price_service_unavailable', message: '價格服務暫時無法使用' },
  ])('passes on 「$message」', async ({ code, message }) => {
    const { gradeBacktestProxy, gradeBacktestApplication } = createApplication()
    gradeBacktestProxy.getGradeBacktest.mockRejectedValue(new BackendRejectionError(code, message))

    await expect(gradeBacktestApplication.getGradeBacktest(new GradeBacktestQueryDto('', '', '', ''))).rejects.toThrow(message)
  })
})
