import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { createAnalysisEvent, createAnalysisResult } from '../../../fixtures/entity-fixtures'
import { linkTargetOf, mountAnalysisRoutes } from '../../../fixtures/console-router'

const completedAnalysisEvent = () => createAnalysisEvent({
  analysisEventId: 42,
  symbol: '2330',
  category: 'twStock',
  status: 'succeeded',
  result: createAnalysisResult({ createdAt: new Date('2026-10-28T01:15:00Z') }),
})

describe('analysis report page', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-28T02:30:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the report of a completed analysis and opens the save dialog once', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(completedAnalysisEvent())

    await router.push('/analysis-events/42/report')
    await flushPromises()

    expect(stack.analysisEventProxy.getAnalysisEvent).toHaveBeenCalledWith(42, 'key')
    expect(wrapper.text()).toContain('標的分析報告')
    expect(wrapper.text()).toContain('分析事件 #42')
    expect(stack.documentPrintProxy.printDocument).toHaveBeenCalledExactlyOnceWith('台股-2330-分析-2026-10-28')
  })

  it('waits for the API key check before opening the save dialog on the shown report', async () => {
    let confirmApiKey: (apiKeyStatus: ApiKeyStatus) => void = () => undefined
    const pendingApiKeyStatus = new Promise<ApiKeyStatus>((resolve) => {
      confirmApiKey = resolve
    })
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events', { storedApiKey: 'key', apiKeyStatus: pendingApiKeyStatus })
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(completedAnalysisEvent())
    const reportShownWhenPrinting: boolean[] = []
    stack.documentPrintProxy.printDocument.mockImplementation(() => {
      reportShownWhenPrinting.push(wrapper.find('.analysis-report-document').exists())
    })

    await router.push('/analysis-events/42/report')
    await flushPromises()
    expect(stack.documentPrintProxy.printDocument).not.toHaveBeenCalled()
    confirmApiKey(new ApiKeyStatus('我的研究', 'active'))
    await flushPromises()

    expect(reportShownWhenPrinting).toEqual([true])
  })

  it('keeps every control out of the printed paper', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(completedAnalysisEvent())

    await router.push('/analysis-events/42/report')
    await flushPromises()
    const paper = wrapper.find('.report-layout__paper')

    expect(paper.text()).toContain('標的分析報告')
    expect(paper.findAll('button')).toHaveLength(0)
    expect(paper.text()).not.toContain('返回分析事件')
    expect(paper.text()).not.toContain('匯出 PDF')
    expect(wrapper.find('.report-layout__toolbar').text()).toContain('返回分析事件')
    expect(wrapper.find('.report-layout__toolbar').text()).toContain('匯出 PDF')
  })

  it('opens the save dialog again from the toolbar and leads back to the analysis event', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(completedAnalysisEvent())
    await router.push('/analysis-events/42/report')
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text() === '匯出 PDF')?.trigger('click')

    expect(stack.documentPrintProxy.printDocument).toHaveBeenCalledTimes(2)
    expect(stack.documentPrintProxy.printDocument).toHaveBeenLastCalledWith('台股-2330-分析-2026-10-28')
    expect(linkTargetOf(wrapper, '返回分析事件')?.props('to')).toBe('/analysis-events/42')
  })

  it.each(['running', 'failed'])('says a %s analysis has nothing to export and does not open the save dialog', async (status) => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ analysisEventId: 43, status }))

    await router.push('/analysis-events/43/report')
    await flushPromises()

    expect(wrapper.text()).toContain('這筆分析尚無可匯出的結果')
    expect(linkTargetOf(wrapper, '返回分析事件')?.props('to')).toBe('/analysis-events/43')
    expect(wrapper.findAll('button').map(button => button.text())).not.toContain('匯出 PDF')
    expect(stack.documentPrintProxy.printDocument).not.toHaveBeenCalled()
  })

  it.each([
    { case: 'no API key', storedApiKey: undefined, apiKeyStatus: new ApiKeyStatus('我的研究', 'active'), guidance: '尚未設定 API key' },
    { case: 'an inactive API key', storedApiKey: 'key', apiKeyStatus: new ApiKeyStatus('我的研究', 'inactive'), guidance: 'API key 尚未啟用，請等候 administrator 啟用' },
    { case: 'an invalid API key', storedApiKey: 'key', apiKeyStatus: new BackendRejectionError('api_key_invalid', 'API key 無效'), guidance: 'API key 無效' },
  ])('guides the user with $case and does not open the save dialog', async ({ storedApiKey, apiKeyStatus, guidance }) => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events', { storedApiKey, apiKeyStatus })
    stack.analysisEventProxy.getAnalysisEvent.mockResolvedValue(completedAnalysisEvent())

    await router.push('/analysis-events/42/report')
    await flushPromises()

    expect(wrapper.text()).toContain(guidance)
    expect(wrapper.text()).not.toContain('標的分析報告')
    expect(stack.documentPrintProxy.printDocument).not.toHaveBeenCalled()
  })

  it('offers a retry when the service is unavailable and does not open the save dialog', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockRejectedValue(new BackendUnavailableError())

    await router.push('/analysis-events/42/report')
    await flushPromises()

    expect(wrapper.text()).toContain('服務暫時無法使用')
    expect(wrapper.findAll('button').map(button => button.text())).toContain('重試')
    expect(stack.documentPrintProxy.printDocument).not.toHaveBeenCalled()
  })

  it('shows the report and opens the save dialog after a successful retry', async () => {
    const { stack, router, wrapper } = await mountAnalysisRoutes('/analysis-events')
    stack.analysisEventProxy.getAnalysisEvent.mockRejectedValueOnce(new BackendUnavailableError()).mockResolvedValue(completedAnalysisEvent())
    await router.push('/analysis-events/42/report')
    await flushPromises()

    await wrapper.findAll('button').find(button => button.text() === '重試')?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('標的分析報告')
    expect(stack.documentPrintProxy.printDocument).toHaveBeenCalledExactlyOnceWith('台股-2330-分析-2026-10-28')
  })
})
