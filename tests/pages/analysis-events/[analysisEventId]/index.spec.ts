import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POLLING_INTERVAL_MILLISECONDS } from '~/composables/use-analysis-event-polling'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { StartedSymbolAnalysis } from '~/domain/models/entities/started-symbol-analysis'
import { STARTED_AT, createAnalysisEvent, createAnalysisResult } from '../../../fixtures/entity-fixtures'
import { linkTargetOf, mountAnalysisRoutes } from '../../../fixtures/console-router'

describe('analysis event page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.setSystemTime(new Date(STARTED_AT.getTime() + 60 * 1000))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts a failed analysis again and opens the new analysis event', async () => {
    const failed = createAnalysisEvent({ analysisEventId: 5, symbol: 'BTC', category: 'crypto', status: 'failed', failureReason: 'AI 服務暫時無法使用' })
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValueOnce(failed)
    await router.push('/analysis-events/5')
    await flushPromises()
    stack.analysisEventProxy.startSymbolAnalysis.mockResolvedValue(new StartedSymbolAnalysis(true, createAnalysisEvent({ analysisEventId: 6, status: 'running' })))
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 6, status: 'running' }))

    expect(wrapper.text()).toContain('分析失敗：AI 服務暫時無法使用')
    await wrapper.findAll('button').find(button => button.text() === '重新發起')?.trigger('click')
    await flushPromises()

    expect(stack.analysisEventProxy.startSymbolAnalysis).toHaveBeenCalledWith(expect.objectContaining({ symbol: 'BTC', category: 'crypto' }), 'key')
    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/6')
    expect(wrapper.text()).toContain('分析中')
  })

  it('stays on the failed analysis and explains why starting again was refused', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 5, status: 'failed', failureReason: 'AI 服務暫時無法使用' }))
    stack.analysisEventProxy.startSymbolAnalysis.mockRejectedValue(new BackendRejectionError('analysis_capacity_reached', '目前分析數量已達上限，請稍後再試'))
    await router.push('/analysis-events/5')
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text() === '重新發起')?.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/5')
    expect(wrapper.text()).toContain('目前分析數量已達上限，請稍後再試')
  })

  it.each([
    { case: 'with its name', symbolName: '台積電', title: '台股 2330 台積電 分析' },
    { case: 'without a name', symbolName: '', title: '台股 2330 分析' },
  ])('titles the page with the symbol $case', async ({ symbolName, title }) => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 5, symbol: '2330', symbolName, category: 'twStock', status: 'failed', failureReason: 'AI 服務暫時無法使用' }))

    await router.push('/analysis-events/5')
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe(title)
  })

  it('says the analysis event does not exist', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockRejectedValue(new BackendRejectionError('analysis_event_not_found', '找不到此分析事件'))

    await router.push('/analysis-events/404')
    await flushPromises()

    expect(wrapper.text()).toContain('找不到此分析事件')
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledWith(404, 'key')
  })

  it('stops updating after leaving the page and queries again when coming back', async () => {
    const { stack, router } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 9, status: 'running' }))
    await router.push('/analysis-events/9')
    await flushPromises()

    await router.push('/analysis-events')
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(1)
    await router.push('/analysis-events/9')
    await flushPromises()

    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(2)
  })
})

describe('analysis event page export', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
    vi.setSystemTime(new Date(STARTED_AT.getTime() + 60 * 1000))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('offers to export a completed analysis as a report in a new tab', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 42, status: 'succeeded', result: createAnalysisResult() }))

    await router.push('/analysis-events/42')
    await flushPromises()
    const exportLink = linkTargetOf(wrapper, '匯出 PDF')

    expect(exportLink?.props('to')).toBe('/analysis-events/42/report')
    expect(exportLink?.attributes('target')).toBe('_blank')
    expect(router.currentRoute.value.fullPath).toBe('/analysis-events/42')
  })

  it.each(['running', 'failed'])('offers no export while the analysis is %s', async (status) => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 42, status, failureReason: 'AI 服務暫時無法使用' }))

    await router.push('/analysis-events/42')
    await flushPromises()

    expect(wrapper.text()).not.toContain('匯出 PDF')
  })

  it('offers the export as soon as the running analysis completes', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent
      .mockResolvedValueOnce(createAnalysisEvent({ analysisEventId: 42, status: 'running' }))
      .mockResolvedValue(createAnalysisEvent({ analysisEventId: 42, status: 'succeeded', result: createAnalysisResult() }))
    await router.push('/analysis-events/42')
    await flushPromises()
    expect(wrapper.text()).not.toContain('匯出 PDF')

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS)
    await flushPromises()

    expect(linkTargetOf(wrapper, '匯出 PDF')?.props('to')).toBe('/analysis-events/42/report')
  })
})
