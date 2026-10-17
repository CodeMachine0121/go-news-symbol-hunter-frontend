import { afterEach, describe, expect, it } from 'vitest'
import { RecentAnalysis } from '~/domain/models/entities/recent-analysis'
import { LocalStorageRecentAnalysisStorageProxy } from '~/infrastructure/proxy/local-storage-recent-analysis-storage-proxy'

describe('LocalStorageRecentAnalysisStorageProxy', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('remembers recent analyses across reads', () => {
    const storage = new LocalStorageRecentAnalysisStorageProxy()
    storage.save([new RecentAnalysis(3, 'BTC', 'crypto', new Date('2026-10-16T02:00:00Z'))])

    expect(new LocalStorageRecentAnalysisStorageProxy().read()).toEqual([new RecentAnalysis(3, 'BTC', 'crypto', new Date('2026-10-16T02:00:00Z'))])
  })

  it.each([
    { case: 'nothing saved', saved: undefined },
    { case: 'corrupted data', saved: '{not json' },
  ])('reads $case as an empty list', ({ saved }) => {
    if (saved !== undefined) {
      localStorage.setItem('go-symbol-news-hunter.recent-analyses', saved)
    }

    expect(new LocalStorageRecentAnalysisStorageProxy().read()).toEqual([])
  })
})
