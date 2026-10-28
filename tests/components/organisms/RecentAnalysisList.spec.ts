import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RecentAnalysisList from '~/components/organisms/RecentAnalysisList.vue'
import { RecentAnalysisListDomain } from '~/domain/models/domains/recent-analysis-list-domain'
import { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

describe('RecentAnalysisList', () => {
  it('links every remembered analysis to its page, newest first', () => {
    const recentAnalyses = [1, 2, 3]
      .reduce((list, analysisEventId) => list.remember(new RecentAnalysis(analysisEventId, 'BTC', '', 'crypto', new Date('2026-10-16T02:00:00Z'))), new RecentAnalysisListDomain([]))
      .toDtos()

    const links = mount(RecentAnalysisList, { props: { recentAnalyses } }).findAllComponents(RouterLinkStub)

    expect(links.map(link => link.props('to'))).toEqual(['/analysis-events/3', '/analysis-events/2', '/analysis-events/1'])
  })

  it.each([
    { case: 'with its name', symbolName: '台積電', text: '台股 2330 台積電' },
    { case: 'remembered before symbol names existed', symbolName: '', text: '台股 2330' },
  ])('shows a remembered analysis $case', ({ symbolName, text }) => {
    const recentAnalyses = new RecentAnalysisListDomain([new RecentAnalysis(1, '2330', symbolName, 'twStock', new Date('2026-10-16T02:00:00Z'))]).toDtos()

    expect(mount(RecentAnalysisList, { props: { recentAnalyses } }).findAll('span')[0]?.text()).toBe(text)
  })

  it('says when nothing has been started yet', () => {
    expect(mount(RecentAnalysisList, { props: { recentAnalyses: [] } }).text()).toContain('還沒有發起過分析')
  })
})
