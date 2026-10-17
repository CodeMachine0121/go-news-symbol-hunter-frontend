import { describe, expect, it } from 'vitest'
import { TrackedSymbolGradeApplication } from '~/application/tracked-symbol-grade-application'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { TrackedSymbolGradeService } from '~/domain/service/tracked-symbol-grade-service'
import { createTrackedSymbolGrade } from '../fixtures/entity-fixtures'
import { mockApiKeyProxy, mockApiKeyStorageProxy, mockTrackedSymbolGradeProxy } from '../fixtures/proxy-mocks'

const createApplication = () => {
  const trackedSymbolGradeProxy = mockTrackedSymbolGradeProxy()
  const apiKeyService = new ApiKeyService(mockApiKeyProxy(), mockApiKeyStorageProxy('api-key'))
  return {
    trackedSymbolGradeProxy,
    trackedSymbolGradeApplication: new TrackedSymbolGradeApplication(new TrackedSymbolGradeService(trackedSymbolGradeProxy, apiKeyService), new MarketCategoryService()),
  }
}

describe('TrackedSymbolGradeApplication', () => {
  it('lists the market categories to choose from', () => {
    expect(createApplication().trackedSymbolGradeApplication.listMarketCategories()).toHaveLength(3)
  })

  it('asks for every tracked symbol when no symbol is given', async () => {
    const { trackedSymbolGradeProxy, trackedSymbolGradeApplication } = createApplication()
    trackedSymbolGradeProxy.getTrackedSymbolGrades.mockResolvedValue([])

    expect(await trackedSymbolGradeApplication.getTrackedSymbolGrades(new SymbolQueryDto('', ''))).toEqual([])
    expect(trackedSymbolGradeProxy.getTrackedSymbolGrades).toHaveBeenCalledWith(undefined, 'api-key')
  })

  it('asks for a single tracked symbol', async () => {
    const { trackedSymbolGradeProxy, trackedSymbolGradeApplication } = createApplication()
    trackedSymbolGradeProxy.getTrackedSymbolGrades.mockResolvedValue([createTrackedSymbolGrade()])

    const trackedSymbolGrades = await trackedSymbolGradeApplication.getTrackedSymbolGrades(new SymbolQueryDto('2330', 'twStock'))

    expect(trackedSymbolGradeProxy.getTrackedSymbolGrades).toHaveBeenCalledWith(expect.objectContaining({ symbol: '2330', category: 'twStock' }), 'api-key')
    expect(trackedSymbolGrades.map(trackedSymbolGrade => trackedSymbolGrade.symbol)).toEqual(['2330'])
  })

  it('does not ask with a symbol but no market category', async () => {
    const { trackedSymbolGradeProxy, trackedSymbolGradeApplication } = createApplication()

    await expect(trackedSymbolGradeApplication.getTrackedSymbolGrades(new SymbolQueryDto('2330', ''))).rejects.toThrow(new InvalidInputError('標的與市場類別需一起提供'))
    expect(trackedSymbolGradeProxy.getTrackedSymbolGrades).not.toHaveBeenCalled()
  })
})
