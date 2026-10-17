import type { IApiKeyStorageProxy } from '~/domain/interface/i-api-key-storage-proxy'

const API_KEY_STORAGE_KEY = 'go-symbol-news-hunter.api-key'

export class LocalStorageApiKeyStorageProxy implements IApiKeyStorageProxy {
  read(): string | undefined {
    try {
      const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY)
      return apiKey === null || apiKey === '' ? undefined : apiKey
    }
    catch {
      return undefined
    }
  }

  save(apiKey: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
  }

  clear(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  }
}
