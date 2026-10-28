import { afterEach, describe, expect, it, vi } from 'vitest'
import { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { AnalysisEventProxy } from '~/infrastructure/proxy/analysis-event-proxy'
import { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'
import { jsonResponse, requestOf, stubFetch } from '../../fixtures/fetch-stub'

const runningEventWire = { analysisEventId: 9, symbol: 'BTC', category: 'crypto', status: 'running', startedAt: '2026-10-16T02:00:00Z' }

const succeededEventWire = (priceAtAnalysis: object | null) => ({
  ...runningEventWire,
  status: 'succeeded',
  finishedAt: '2026-10-16T02:01:00Z',
  result: {
    grade: 'bullish',
    confidence: 72,
    timeHorizon: 'short',
    reason: '理由',
    keyEvents: [{ title: '事件', link: 'https://news.example/1', publishedAt: '2026-10-15T00:00:00Z' }],
    riskFactors: null,
    evidence: [{ title: '佐證', link: 'https://news.example/2', publishedAt: '2026-10-15T00:00:00Z', providerName: 'CoinDesk' }],
    priceAtAnalysis,
    createdAt: '2026-10-16T02:01:00Z',
  },
})

const createProxy = () => new AnalysisEventProxy(new BackendHttpProxy('http://backend.test'))

describe('AnalysisEventProxy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each([
    { status: 202, isNew: true },
    { status: 200, isNew: false },
  ])('tells whether the started analysis is new from status $status', async ({ status, isNew }) => {
    const fetchStub = stubFetch(jsonResponse(status, runningEventWire))

    const startedSymbolAnalysis = await createProxy().startSymbolAnalysis(new SymbolQueryVo('BTC', 'crypto'), 'key')

    expect(startedSymbolAnalysis.isNew).toBe(isNew)
    expect(startedSymbolAnalysis.analysisEvent).toMatchObject({ analysisEventId: 9, status: 'running', result: undefined, finishedAt: undefined })
    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/analysis-events', method: 'POST', apiKey: 'key', body: '{"symbol":"BTC","category":"crypto"}' })
  })

  it.each([
    { case: 'with a name', wire: { ...runningEventWire, symbolName: 'Bitcoin' }, symbolName: 'Bitcoin' },
    { case: 'with an empty name', wire: { ...runningEventWire, symbolName: '' }, symbolName: '' },
    { case: 'from a backend that sends no name', wire: runningEventWire, symbolName: '' },
  ])('reads the symbol name $case', async ({ wire, symbolName }) => {
    stubFetch(jsonResponse(200, wire))

    expect((await createProxy().getAnalysisEvent(9, 'key')).symbolName).toBe(symbolName)
  })

  it('reads a completed analysis without losing price precision', async () => {
    const fetchStub = stubFetch(jsonResponse(200, succeededEventWire({ price: '0.00001234', currency: 'USDT', pricedAt: '2026-10-16T02:01:00Z', source: 'Binance' })))

    const analysisEvent = await createProxy().getAnalysisEvent(9, 'key')

    expect(requestOf(fetchStub)).toMatchObject({ url: 'http://backend.test/analysis-events/9', method: 'GET', apiKey: 'key' })
    expect(analysisEvent.finishedAt).toEqual(new Date('2026-10-16T02:01:00Z'))
    expect(analysisEvent.result?.priceAtAnalysis?.price.toFixed()).toBe('0.00001234')
    expect(analysisEvent.result?.priceAtAnalysis).toMatchObject({ currency: 'USDT', source: 'Binance' })
    expect(analysisEvent.result?.keyEvents[0]).toMatchObject({ title: '事件' })
    expect(analysisEvent.result?.evidence[0]).toMatchObject({ providerName: 'CoinDesk' })
    expect(analysisEvent.result?.riskFactors).toEqual([])
  })

  it('reads a completed analysis whose price was not obtained', async () => {
    stubFetch(jsonResponse(200, succeededEventWire(null)))

    expect((await createProxy().getAnalysisEvent(9, 'key')).result?.priceAtAnalysis).toBeUndefined()
  })
})
