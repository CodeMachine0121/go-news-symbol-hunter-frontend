import { describe, expect, it } from 'vitest'
import { RecentAnalysisListDomain } from '~/domain/models/domains/recent-analysis-list-domain'
import { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

const createRecentAnalysis = (analysisEventId: number): RecentAnalysis =>
  new RecentAnalysis(analysisEventId, 'BTC', 'crypto', new Date('2026-10-16T02:00:00Z'))

const rememberAll = (analysisEventIds: number[]): RecentAnalysisListDomain =>
  analysisEventIds.reduce((list, analysisEventId) => list.remember(createRecentAnalysis(analysisEventId)), new RecentAnalysisListDomain([]))

const analysisEventIdsOf = (list: RecentAnalysisListDomain): number[] => list.toDtos().map(recentAnalysis => recentAnalysis.analysisEventId)

describe('RecentAnalysisListDomain', () => {
  it('lists started analyses newest first', () => {
    expect(analysisEventIdsOf(rememberAll([1, 2, 3]))).toEqual([3, 2, 1])
  })

  it('keeps at most 20, dropping the oldest', () => {
    const list = rememberAll(Array.from({ length: 21 }, (_, index) => index + 1))

    expect(analysisEventIdsOf(list)).toHaveLength(20)
    expect(analysisEventIdsOf(list)[0]).toBe(21)
    expect(analysisEventIdsOf(list)).not.toContain(1)
  })

  it('lists a reused analysis event once, at the top', () => {
    expect(analysisEventIdsOf(rememberAll([5, 4, 5]))).toEqual([5, 4])
    expect(analysisEventIdsOf(rememberAll([4, 5, 4]))).toEqual([4, 5])
  })

  it('presents each entry with its market category label and start time', () => {
    expect(rememberAll([7]).toDtos()[0]).toMatchObject({ symbol: 'BTC', startedAtText: '2026-10-16 10:00', category: { label: '加密貨幣' } })
  })

  it('returns a copy of its entries', () => {
    expect(rememberAll([1, 2]).toEntities().map(recentAnalysis => recentAnalysis.analysisEventId)).toEqual([2, 1])
  })
})
