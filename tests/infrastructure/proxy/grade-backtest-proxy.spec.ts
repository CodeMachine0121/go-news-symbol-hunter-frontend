import { afterEach, describe, expect, it, vi } from 'vitest'
import { GradeBacktestQueryVo } from '~/domain/models/vo/grade-backtest-query-vo'
import { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { GradeBacktestProxy } from '~/infrastructure/proxy/grade-backtest-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

const createProxy = () => new GradeBacktestProxy(new BackendHttpProxy('http://backend.test'))

describe('GradeBacktestProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the backtest of a period and a symbol', async () => {
    const fetchStub = stubFetch(jsonResponse(200, {
      randomBaseline: 0.5,
      overall: { hitCount: 26, missCount: 14, hitRate: 0.65 },
      byCategory: { twStock: { hitCount: 26, missCount: 14, hitRate: 0.65 } },
      byGrade: {},
      byConfidenceBand: { high: { hitCount: 0, missCount: 0, hitRate: null } },
      bySource: { manual: { hitCount: 6, missCount: 4, hitRate: 0.6 }, background: { hitCount: 0, missCount: 0, hitRate: null } },
      neutralAverageChangeRate: '0.03',
      outcomeCounts: { hit: 26 },
      analyses: [{
        gradeRecordId: 7,
        source: 'manual',
        analysisEventId: 42,
        tradingDay: null,
        symbol: '2330',
        category: 'twStock',
        grade: 'bullish',
        confidence: 80,
        timeHorizon: 'short',
        completedAt: '2026-10-01T02:00:00Z',
        entryPrice: '1000.5',
        checkpointDate: null,
        checkpointPrice: null,
        priceChangeRate: null,
        outcome: 'pending',
      }, {
        gradeRecordId: 8,
        source: 'background',
        analysisEventId: null,
        tradingDay: '2026-10-28',
        symbol: '4958',
        category: 'twStock',
        grade: 'neutral',
        confidence: 50,
        timeHorizon: 'short',
        completedAt: '2026-10-28T04:31:10Z',
        entryPrice: '548',
        checkpointDate: null,
        checkpointPrice: null,
        priceChangeRate: null,
        outcome: 'pending',
      }],
    }))

    const gradeBacktest = await createProxy().getGradeBacktest(new GradeBacktestQueryVo('2026-10-01', '2026-10-31', new SymbolQueryVo('2330', 'twStock'), 'manual'), 'key')

    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/grade-backtest?completedFrom=2026-10-01&completedTo=2026-10-31&symbol=2330&category=twStock&source=manual', method: 'GET', apiKey: 'key' })
    expect(gradeBacktest.overall).toMatchObject({ hitCount: 26, hitRate: 0.65 })
    expect(gradeBacktest.byCategory.get('twStock')).toMatchObject({ hitCount: 26, missCount: 14, hitRate: 0.65 })
    expect(gradeBacktest.byConfidenceBand.get('high')).toMatchObject({ hitCount: 0, hitRate: undefined })
    expect(gradeBacktest.neutralAverageChangeRate?.toFixed()).toBe('0.03')
    expect(gradeBacktest.outcomeCounts.get('hit')).toBe(26)
    expect(gradeBacktest.bySource.get('manual')).toMatchObject({ hitCount: 6, missCount: 4, hitRate: 0.6 })
    expect(gradeBacktest.bySource.get('background')).toMatchObject({ hitCount: 0, hitRate: undefined })
    expect(gradeBacktest.analyses[0]).toMatchObject({ gradeRecordId: 7, source: 'manual', analysisEventId: 42, tradingDay: undefined, checkpointDate: undefined, checkpointPrice: undefined, priceChangeRate: undefined })
    expect(gradeBacktest.analyses[1]).toMatchObject({ gradeRecordId: 8, source: 'background', analysisEventId: undefined, tradingDay: '2026-10-28' })
    expect(gradeBacktest.analyses[0]?.entryPrice?.toFixed()).toBe('1000.5')
  })

  it('reads an empty backtest for every analysis', async () => {
    const fetchStub = stubFetch(jsonResponse(200, {
      randomBaseline: 0.5,
      overall: { hitCount: 0, missCount: 0, hitRate: null },
      byCategory: null,
      byGrade: null,
      byConfidenceBand: null,
      bySource: null,
      neutralAverageChangeRate: null,
      outcomeCounts: null,
      analyses: null,
    }))

    const gradeBacktest = await createProxy().getGradeBacktest(new GradeBacktestQueryVo(undefined, undefined, undefined, undefined), 'key')

    expect(requestOf(fetchStub).url).toBe('http://backend.test/grade-backtest')
    expect(gradeBacktest.byCategory.size).toBe(0)
    expect(gradeBacktest.bySource.size).toBe(0)
    expect(gradeBacktest.neutralAverageChangeRate).toBeUndefined()
    expect(gradeBacktest.outcomeCounts.size).toBe(0)
    expect(gradeBacktest.analyses).toEqual([])
  })
})
