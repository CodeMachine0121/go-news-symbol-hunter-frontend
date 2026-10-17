import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageApiKeyStorageProxy } from '~/infrastructure/proxy/local-storage-api-key-storage-proxy'

describe('LocalStorageApiKeyStorageProxy', () => {
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('remembers and forgets the API key', () => {
    const storage = new LocalStorageApiKeyStorageProxy()

    expect(storage.read()).toBeUndefined()
    storage.save('full-key')
    expect(storage.read()).toBe('full-key')
    storage.clear()
    expect(storage.read()).toBeUndefined()
  })

  it('treats an empty saved value as no API key', () => {
    localStorage.setItem('go-symbol-news-hunter.api-key', '')

    expect(new LocalStorageApiKeyStorageProxy().read()).toBeUndefined()
  })

  it('treats an unreadable storage as no API key', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(new LocalStorageApiKeyStorageProxy().read()).toBeUndefined()
  })
})
