import { AnalysisReportApplication } from '~/application/analysis-report-application'
import { ApiKeyApplication } from '~/application/api-key-application'
import { SymbolAnalysisApplication } from '~/application/symbol-analysis-application'
import { ApiKeyAccessState } from '~/composables/api-key-access-state'
import { ANALYSIS_REPORT_APPLICATION, API_KEY_ACCESS_STATE, API_KEY_APPLICATION, SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { AnalysisReportService } from '~/domain/service/analysis-report-service'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { SymbolAnalysisService } from '~/domain/service/symbol-analysis-service'
import { mockAnalysisEventProxy, mockApiKeyProxy, mockApiKeyStorageProxy, mockDocumentPrintProxy, mockRecentAnalysisStorageProxy } from './proxy-mocks'

export const createApplicationStack = (storedApiKey?: string) => {
  const apiKeyProxy = mockApiKeyProxy()
  const analysisEventProxy = mockAnalysisEventProxy()
  const documentPrintProxy = mockDocumentPrintProxy()
  const apiKeyService = new ApiKeyService(apiKeyProxy, mockApiKeyStorageProxy(storedApiKey))
  const provide = {
    [API_KEY_ACCESS_STATE]: new ApiKeyAccessState(),
    [API_KEY_APPLICATION]: new ApiKeyApplication(apiKeyService),
    [SYMBOL_ANALYSIS_APPLICATION]: new SymbolAnalysisApplication(
      new SymbolAnalysisService(analysisEventProxy, mockRecentAnalysisStorageProxy(), apiKeyService),
      new MarketCategoryService(),
    ),
    [ANALYSIS_REPORT_APPLICATION]: new AnalysisReportApplication(new AnalysisReportService(analysisEventProxy, documentPrintProxy, apiKeyService)),
  }
  return { apiKeyProxy, analysisEventProxy, documentPrintProxy, provide }
}
