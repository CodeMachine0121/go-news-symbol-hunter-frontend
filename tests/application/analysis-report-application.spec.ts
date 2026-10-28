import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysisReportApplication } from '~/application/analysis-report-application'
import { AnalysisReportUnavailableError } from '~/domain/errors/analysis-report-unavailable-error'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { AnalysisReportService } from '~/domain/service/analysis-report-service'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { createAnalysisEvent, createAnalysisResult } from '../fixtures/entity-fixtures'
import { mockAnalysisEventProxy, mockApiKeyProxy, mockApiKeyStorageProxy, mockDocumentPrintProxy } from '../fixtures/proxy-mocks'

const createApplication = ({ storedApiKey }: { storedApiKey?: string } = { storedApiKey: 'api-key' }) => {
  const analysisEventProxy = mockAnalysisEventProxy()
  const documentPrintProxy = mockDocumentPrintProxy()
  const apiKeyService = new ApiKeyService(mockApiKeyProxy(), mockApiKeyStorageProxy(storedApiKey))
  return {
    analysisEventProxy,
    documentPrintProxy,
    analysisReportApplication: new AnalysisReportApplication(new AnalysisReportService(analysisEventProxy, documentPrintProxy, apiKeyService)),
  }
}

describe('AnalysisReportApplication', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T02:30:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('builds the report of a completed analysis, stamped with the export time', async () => {
    const { analysisEventProxy, analysisReportApplication } = createApplication()
    analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({
      analysisEventId: 42,
      symbol: '2330',
      category: 'twStock',
      status: 'succeeded',
      result: createAnalysisResult({ createdAt: new Date('2026-10-28T01:15:00Z') }),
    }))

    const analysisReport = await analysisReportApplication.getAnalysisReport(42)

    expect(analysisEventProxy.getAnalysisEvent).toHaveBeenCalledWith(42, 'api-key')
    expect(analysisReport).toMatchObject({ analysisEventId: 42, fileName: '台股-2330-分析-2026-10-28', exportedAtText: '2026-10-28 10:30' })
  })

  it.each(['running', 'failed'])('refuses the report of a %s analysis', async (status) => {
    const { analysisEventProxy, analysisReportApplication } = createApplication()
    analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ status }))

    await expect(analysisReportApplication.getAnalysisReport(43)).rejects.toThrow(AnalysisReportUnavailableError)
  })

  it('asks for an API key before fetching the analysis event', async () => {
    const { analysisEventProxy, analysisReportApplication } = createApplication({})

    await expect(analysisReportApplication.getAnalysisReport(42)).rejects.toThrow(BackendRejectionError)
    expect(analysisEventProxy.getAnalysisEvent).not.toHaveBeenCalled()
  })

  it('prints the report under its default file name', async () => {
    const { analysisEventProxy, documentPrintProxy, analysisReportApplication } = createApplication()
    analysisEventProxy.getAnalysisEvent.mockResolvedValue(createAnalysisEvent({ symbol: 'AAPL', category: 'usStock', status: 'succeeded', result: createAnalysisResult({ createdAt: new Date('2026-10-27T05:00:00Z') }) }))

    analysisReportApplication.printAnalysisReport(await analysisReportApplication.getAnalysisReport(7))

    expect(documentPrintProxy.printDocument).toHaveBeenCalledExactlyOnceWith('美股-AAPL-分析-2026-10-27')
  })
})
