import { vi } from 'vitest'
import type { IApiKeyProxy } from '~/domain/interface/i-api-key-proxy'
import type { IApiKeyStorageProxy } from '~/domain/interface/i-api-key-storage-proxy'

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
