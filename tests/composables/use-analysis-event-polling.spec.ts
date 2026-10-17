import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted } from 'vue'
import { POLLING_INTERVAL_MILLISECONDS, useAnalysisEventPolling } from '~/composables/use-analysis-event-polling'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { STARTED_AT, createAnalysisEvent, createAnalysisResult } from '../fixtures/entity-fixtures'
import { createApplicationStack } from '../fixtures/application-stack'

const mountPolling = (stack: ReturnType<typeof createApplicationStack>) => {
  const exposed: { polling?: ReturnType<typeof useAnalysisEventPolling> } = {}
  const wrapper = mount(defineComponent({
    setup() {
      exposed.polling = useAnalysisEventPolling(9)
      onMounted(() => exposed.polling?.load())
      return () => h('p', exposed.polling?.analysisEvent.value?.status.label ?? exposed.polling?.error.value?.message ?? '')
    },
  }), { global: { provide: stack.provide } })
  return { wrapper, exposed }
}

describe('useAnalysisEventPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(STARTED_AT.getTime() + 60 * 1000))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('re-queries every 3 seconds while running and stops once the analysis completes', async () => {
    const stack = createApplicationStack('key')
    stack.analysisEventProxy.getAnalysisEvent
      .mockResolvedValueOnce(createAnalysisEvent({ status: 'running' }))
      .mockResolvedValueOnce(createAnalysisEvent({ status: 'running' }))
      .mockResolvedValueOnce(createAnalysisEvent({ status: 'succeeded', result: createAnalysisResult() }))

    const { wrapper } = mountPolling(stack)
    await flushPromises()
    expect(wrapper.text()).toBe('分析中')
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS)
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS)
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)

    expect(wrapper.text()).toBe('已完成')
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(3)
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledWith(9, 'key')
  })

  it('stops re-querying when leaving the page and queries again when coming back', async () => {
    const stack = createApplicationStack('key')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ status: 'running' }))

    const { wrapper } = mountPolling(stack)
    await flushPromises()
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(1)
    mountPolling(stack)
    await flushPromises()

    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(2)
  })

  it('does not schedule another query when leaving while a query is still in flight', async () => {
    const stack = createApplicationStack('key')
    let answer: (value: ReturnType<typeof createAnalysisEvent>) => void = () => {}
    stack.analysisEventProxy.getAnalysisEvent.mockReturnValue(new Promise((resolve) => {
      answer = resolve
    }))

    const { wrapper } = mountPolling(stack)
    wrapper.unmount()
    answer(createAnalysisEvent({ status: 'running' }))
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)

    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(1)
  })

  it('keeps a single schedule when the user refreshes by hand while waiting', async () => {
    const stack = createApplicationStack('key')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ status: 'running' }))
    const { exposed } = mountPolling(stack)
    await flushPromises()

    await exposed.polling?.load()
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS)

    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(3)
  })

  it.each([
    { case: 'a rejection', failure: new BackendRejectionError('analysis_event_not_found', '找不到此分析事件'), text: '找不到此分析事件' },
    { case: 'a non-error failure', failure: 'boom', text: 'boom' },
  ])('stops and reports $case', async ({ failure, text }) => {
    const stack = createApplicationStack('key')
    stack.analysisEventProxy.getAnalysisEvent.mockRejectedValue(failure)

    const { wrapper } = mountPolling(stack)
    await flushPromises()
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MILLISECONDS * 5)

    expect(wrapper.text()).toBe(text)
    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledTimes(1)
  })
})
