import { vi } from 'vitest'
import type { IAnalysisEventProxy } from '~/domain/interface/i-analysis-event-proxy'
import type { IApiKeyProxy } from '~/domain/interface/i-api-key-proxy'
import type { IApiKeyStorageProxy } from '~/domain/interface/i-api-key-storage-proxy'
import type { INewsProxy } from '~/domain/interface/i-news-proxy'
import type { IRecentAnalysisStorageProxy } from '~/domain/interface/i-recent-analysis-storage-proxy'
import type { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

export const mockApiKeyProxy = () => ({
  issueApiKey: vi.fn<IApiKeyProxy['issueApiKey']>(),
  getApiKeyStatus: vi.fn<IApiKeyProxy['getApiKeyStatus']>(),
  revokeApiKey: vi.fn<IApiKeyProxy['revokeApiKey']>(),
}) satisfies IApiKeyProxy

export const mockApiKeyStorageProxy = (initialApiKey?: string) => {
  let apiKey = initialApiKey
  return {
    read: vi.fn<IApiKeyStorageProxy['read']>(() => apiKey),
    save: vi.fn<IApiKeyStorageProxy['save']>((nextApiKey) => {
      apiKey = nextApiKey
    }),
    clear: vi.fn<IApiKeyStorageProxy['clear']>(() => {
      apiKey = undefined
    }),
  } satisfies IApiKeyStorageProxy
}

export const mockRecentAnalysisStorageProxy = (initialRecentAnalyses: RecentAnalysis[] = []) => {
  let recentAnalyses = initialRecentAnalyses
  return {
    read: vi.fn<IRecentAnalysisStorageProxy['read']>(() => recentAnalyses),
    save: vi.fn<IRecentAnalysisStorageProxy['save']>((nextRecentAnalyses) => {
      recentAnalyses = nextRecentAnalyses
    }),
  } satisfies IRecentAnalysisStorageProxy
}

export const mockNewsProxy = () => ({
  searchSymbolNews: vi.fn<INewsProxy['searchSymbolNews']>(),
}) satisfies INewsProxy

export const mockAnalysisEventProxy = () => ({
  startSymbolAnalysis: vi.fn<IAnalysisEventProxy['startSymbolAnalysis']>(),
  getAnalysisEvent: vi.fn<IAnalysisEventProxy['getAnalysisEvent']>(),
}) satisfies IAnalysisEventProxy
