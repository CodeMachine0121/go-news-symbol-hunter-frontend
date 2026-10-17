import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POLLING_INTERVAL_MILLISECONDS } from '~/composables/use-analysis-event-polling'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { StartedSymbolAnalysis } from '~/domain/models/entities/started-symbol-analysis'
import { STARTED_AT, createAnalysisEvent } from '../../fixtures/entity-fixtures'
import { mountAnalysisRoutes } from '../../fixtures/console-router'

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
