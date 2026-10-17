import type { RecentAnalysisDto } from '~/domain/models/dto/recent-analysis-dto'
import type { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

export const RECENT_ANALYSIS_LIMIT = 20

export class RecentAnalysisListDomain {
  constructor(private readonly recentAnalyses: RecentAnalysis[]) {}

  remember(recentAnalysis: RecentAnalysis): RecentAnalysisListDomain {
    const others = this.recentAnalyses.filter(existing => existing.analysisEventId !== recentAnalysis.analysisEventId)
    return new RecentAnalysisListDomain([recentAnalysis, ...others].slice(0, RECENT_ANALYSIS_LIMIT))
  }

  toEntities(): RecentAnalysis[] {
    return [...this.recentAnalyses]
  }

  toDtos(): RecentAnalysisDto[] {
    return this.recentAnalyses.map(recentAnalysis => recentAnalysis.toDto())
  }
}
