import { flushPromises, RouterLinkStub } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POLLING_INTERVAL_MILLISECONDS } from '~/composables/use-analysis-event-polling'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { SymbolAmbiguousError } from '~/domain/errors/symbol-ambiguous-error'
import { SymbolCandidateVo } from '~/domain/models/vo/symbol-candidate-vo'
import { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'
import { StartedSymbolAnalysis } from '~/domain/models/entities/started-symbol-analysis'
import { STARTED_AT, createAnalysisEvent, createAnalysisResult } from '../../fixtures/entity-fixtures'
import { mountAnalysisRoutes } from '../../fixtures/console-router'

const startBtcAnalysis = async (wrapper: Awaited<ReturnType<typeof mountAnalysisRoutes>>['wrapper']) => {
  await wrapper.find('select').setValue('crypto')
  await wrapper.find('input').setValue('BTC')
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('analysis events page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.setSystemTime(new Date(STARTED_AT.getTime() + 60 * 1000))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('opens a new analysis, shows 分析中 and shows the result once it completes', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis.mockResolvedValue(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId: 9, status: 'running' })))
    stack.analysisEventProxy.getAnalysisEvent
      .mockResolvedValueOnce(createAnalysisEvent({ analysisEventId: 9, status: 'running' }))
      .mockResolvedValueOnce(createAnalysisEvent({ analysisEventId: 9, status: 'succeeded', result: createAnalysisResult() }))

    await startBtcAnalysis(wrapper)

    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/9')
    expect(wrapper.text()).toContain('分析中')
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS)
    await flushPromises()
    expect(wrapper.text()).toContain('營收創新高')
    expect(wrapper.text()).toContain('看多')
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(2)
  })

  it('opens a reused completed analysis with its result and does not wait', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    const completed = createAnalysisEvent({ analysisEventId: 7, status: 'succeeded', result: createAnalysisResult() })
    stack.analysisEventProxy.startSymbolAnalysis.mockResolvedValue(new StartedSymbolAnalysis(false, completed))
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(completed)

    await startBtcAnalysis(wrapper)
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)

    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/7')
    expect(wrapper.text()).toContain('營收創新高')
    expect(wrapper.text()).not.toContain('每 3 秒自動更新')
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(1)
  })

  it('opens a reused running analysis and keeps waiting', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    const running = createAnalysisEvent({ analysisEventId: 8, status: 'running' })
    stack.analysisEventProxy.startSymbolAnalysis.mockResolvedValue(new StartedSymbolAnalysis(false, running))
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(running)

    await startBtcAnalysis(wrapper)
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS)

    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/8')
    expect(wrapper.text()).toContain('分析中')
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(2)
  })

  it('stays on the form when the service is at capacity', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis.mockRejectedValue(new BackendRejectionError('analysis_capacity_reached', '目前分析數量已達上限，請稍後再試'))

    await startBtcAnalysis(wrapper)

    expect(router.currentRoute.value.fullPath).toBe('/analysis-events')
    expect(wrapper.text()).toContain('目前分析數量已達上限，請稍後再試')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('sends a start only once while the first one is still in flight', async () => {
    const { stack, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis.mockReturnValue(new Promise(() => {}))
    await wrapper.find('select').setValue('crypto')
    await wrapper.find('input').setValue('BTC')
    const submitButton = wrapper.find<HTMLButtonElement>('button[type="submit"]')

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(submitButton.element.disabled).toBe(true)
    await submitButton.trigger('click')
    await flushPromises()

    expect(stack.analysisEventProxy.startSymbolAnalysis).toHaveBeenCalledTimes(1)
  })

  it('hints that a name may be typed', async () => {
    const { wrapper } = await mountAnalysisRoutes('/analysis-events')

    expect(wrapper.find('input').attributes('placeholder')).toBe('例如 2330、台積電、AAPL、Bitcoin')
  })

  const startCathayAnalysis = async (wrapper: Awaited<ReturnType<typeof mountAnalysisRoutes>>['wrapper']) => {
    await wrapper.find('select').setValue('twStock')
    await wrapper.find('input').setValue('國泰')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  const candidateButtons = (wrapper: Awaited<ReturnType<typeof mountAnalysisRoutes>>['wrapper']) => wrapper.findAll('[aria-label="候選標的"] button')

  it.each([
    { case: 'with names', candidates: [new SymbolCandidateVo('2882', '國泰金'), new SymbolCandidateVo('00878', '國泰永續高股息')], expectedLabels: ['2882 國泰金', '00878 國泰永續高股息'] },
    { case: 'without a name', candidates: [new SymbolCandidateVo('BTC', ''), new SymbolCandidateVo('BCH', 'Bitcoin Cash')], expectedLabels: ['BTC', 'BCH Bitcoin Cash'] },
    { case: 'when the service attaches none', candidates: [], expectedLabels: [] },
  ])('lists the candidates of an ambiguous name $case', async ({ candidates, expectedLabels }) => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis.mockRejectedValue(new SymbolAmbiguousError('symbol_ambiguous', '符合多個標的，請改填代號或更完整的名稱', candidates))

    await startCathayAnalysis(wrapper)

    expect(router.currentRoute.value.fullPath).toBe('/analysis-events')
    expect(wrapper.text()).toContain('符合多個標的，請改填代號或更完整的名稱')
    expect(candidateButtons(wrapper).map(button => button.text())).toEqual(expectedLabels)
  })

  it('starts the chosen candidate in the market category of the ambiguous start', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis
      .mockRejectedValueOnce(new SymbolAmbiguousError('symbol_ambiguous', '符合多個標的，請改填代號或更完整的名稱', [new SymbolCandidateVo('2882', '國泰金'), new SymbolCandidateVo('00878', '國泰永續高股息')]))
      .mockResolvedValueOnce(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId: 12, symbol: '2882', symbolName: '國泰金', category: 'twStock', status: 'running' })))
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 12, symbol: '2882', symbolName: '國泰金', category: 'twStock', status: 'running' }))
    await startCathayAnalysis(wrapper)

    await candidateButtons(wrapper)[0]!.trigger('click')
    await flushPromises()

    expect(stack.analysisEventProxy.startSymbolAnalysis).toHaveBeenLastCalledWith(new SymbolQueryVo('2882', 'twStock'), expect.any(String))
    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/12')
  })

  it('keeps the candidates disabled while a chosen one is starting', async () => {
    const { stack, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis
      .mockRejectedValueOnce(new SymbolAmbiguousError('symbol_ambiguous', '符合多個標的，請改填代號或更完整的名稱', [new SymbolCandidateVo('2882', '國泰金')]))
      .mockReturnValueOnce(new Promise(() => {}))
    await startCathayAnalysis(wrapper)

    await candidateButtons(wrapper)[0]!.trigger('click')
    await flushPromises()

    expect(candidateButtons(wrapper).map(button => (button.element as HTMLButtonElement).disabled)).toEqual([true])
  })

  it('shows a symbol that is not found without candidates', async () => {
    const { stack, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis.mockRejectedValue(new BackendRejectionError('symbol_not_found', '找不到此標的'))

    await startCathayAnalysis(wrapper)

    expect(wrapper.text()).toContain('找不到此標的')
    expect(candidateButtons(wrapper)).toHaveLength(0)
  })

  it('lists the analyses started in this browser', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.startSymbolAnalysis.mockResolvedValue(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId: 9, status: 'running' })))
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 9, status: 'running' }))
    await startBtcAnalysis(wrapper)

    await router.push('/analysis-events')
    await flushPromises()

    expect(wrapper.findAllComponents(RouterLinkStub).map(link => link.props('to'))).toContain('/analysis-events/9')
  })
})
