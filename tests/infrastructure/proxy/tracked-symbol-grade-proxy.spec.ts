import { afterEach, describe, expect, it, vi } from 'vitest'
import { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { TrackedSymbolGradeProxy } from '~/infrastructure/proxy/tracked-symbol-grade-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

const createProxy = () => new TrackedSymbolGradeProxy(new BackendHttpProxy('http://backend.test'))

describe('TrackedSymbolGradeProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads tracked symbol grades for a single symbol', async () => {
    const fetchStub = stubFetch(jsonResponse(200, [{
      symbol: '2330',
      category: 'twStock',
      tradingDay: '2026-10-16',
      grade: 'bullish',
      combinedScore: 0.85,
      confidence: 70,
      updatedAt: '2026-10-16T05:00:00Z',
      sessionGrades: [{ session: 'preMarket', grade: 'bullish', confidence: 70, reason: '理由', keyEvents: null, riskFactors: null, evidence: null, createdAt: '2026-10-16T00:30:00Z' }],
    }]))

    const trackedSymbolGrades = await createProxy().getTrackedSymbolGrades(new SymbolQueryVo('2330', 'twStock'), 'key')

    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/tracked-symbol-grades?symbol=2330&category=twStock', method: 'GET', apiKey: 'key' })
    expect(trackedSymbolGrades[0]).toMatchObject({ symbol: '2330', combinedScore: 0.85, updatedAt: new Date('2026-10-16T05:00:00Z') })
    expect(trackedSymbolGrades[0]?.sessionGrades[0]).toMatchObject({ session: 'preMarket', keyEvents: [], riskFactors: [], evidence: [] })
  })

  it.each([
    { case: 'with a name', symbolName: '台積電', expected: '台積電' },
    { case: 'from a backend that sends no name', symbolName: undefined, expected: '' },
  ])('reads the symbol name $case', async ({ symbolName, expected }) => {
    stubFetch(jsonResponse(200, [{ symbol: '2330', symbolName, category: 'twStock', tradingDay: '2026-10-16', grade: 'neutral', combinedScore: 0, confidence: 50, updatedAt: '2026-10-16T05:00:00Z', sessionGrades: null }]))

    expect((await createProxy().getTrackedSymbolGrades(undefined, 'key'))[0]?.symbolName).toBe(expected)
  })

  it('reads every tracked symbol and tolerates empty answers', async () => {
    const fetchStub = stubFetch(jsonResponse(200, [{ symbol: '2330', category: 'twStock', tradingDay: '2026-10-16', grade: 'neutral', combinedScore: 0, confidence: 50, updatedAt: '2026-10-16T05:00:00Z', sessionGrades: null }]), jsonResponse(200, null))

    expect((await createProxy().getTrackedSymbolGrades(undefined, 'key'))[0]?.sessionGrades).toEqual([])
    expect(requestOf(fetchStub).url).toBe('http://backend.test/tracked-symbol-grades')
    expect(await createProxy().getTrackedSymbolGrades(undefined, 'key')).toEqual([])
  })
})
