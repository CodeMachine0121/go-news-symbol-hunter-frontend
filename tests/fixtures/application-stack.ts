import { ApiKeyApplication } from '~/application/api-key-application'
import { SymbolAnalysisApplication } from '~/application/symbol-analysis-application'
import { ApiKeyAccessState } from '~/composables/api-key-access-state'
import { API_KEY_ACCESS_STATE, API_KEY_APPLICATION, SYMBOL_ANALYSIS_APPLICATION } from '~/composables/application-injection-keys'
import { ApiKeyService } from '~/domain/service/api-key-service'
import { MarketCategoryService } from '~/domain/service/market-category-service'
import { SymbolAnalysisService } from '~/domain/service/symbol-analysis-service'
import { mockAnalysisEventProxy, mockApiKeyProxy, mockApiKeyStorageProxy, mockRecentAnalysisStorageProxy } from './proxy-mocks'

export const createApplicationStack = (storedApiKey?: string) => {
  const apiKeyProxy = mockApiKeyProxy()
  const analysisEventProxy = mockAnalysisEventProxy()
  const apiKeyService = new ApiKeyService(apiKeyProxy, mockApiKeyStorageProxy(storedApiKey))
  const provide = {
    [API_KEY_ACCESS_STATE]: new ApiKeyAccessState(),
    [API_KEY_APPLICATION]: new ApiKeyApplication(apiKeyService),
    [SYMBOL_ANALYSIS_APPLICATION]: new SymbolAnalysisApplication(
      new SymbolAnalysisService(analysisEventProxy, mockRecentAnalysisStorageProxy(), apiKeyService),
      new MarketCategoryService(),
    ),
  }
  return { apiKeyProxy, analysisEventProxy, provide }
}
