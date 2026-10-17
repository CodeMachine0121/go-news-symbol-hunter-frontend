import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RecentAnalysisList from '~/components/organisms/RecentAnalysisList.vue'
import { RecentAnalysisListDomain } from '~/domain/models/domains/recent-analysis-list-domain'
import { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

describe('RecentAnalysisList', () => {
  it('links every remembered analysis to its page, newest first', () => {
    const recentAnalyses = [1, 2, 3]
      .reduce((list, analysisEventId) => list.remember(new RecentAnalysis(analysisEventId, 'BTC', 'crypto', new Date('2026-10-16T02:00:00Z'))), new RecentAnalysisListDomain([]))
      .toDtos()

    const links = mount(RecentAnalysisList, { props: { recentAnalyses } }).findAllComponents(RouterLinkStub)

    expect(links.map(link => link.props('to'))).toEqual(['/analysis-events/3', '/analysis-events/2', '/analysis-events/1'])
  })

  it('says when nothing has been started yet', () => {
    expect(mount(RecentAnalysisList, { props: { recentAnalyses: [] } }).text()).toContain('還沒有發起過分析')
  })
})
