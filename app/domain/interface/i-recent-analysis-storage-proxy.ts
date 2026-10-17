import type { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

export interface IRecentAnalysisStorageProxy {
  read(): RecentAnalysis[]
  save(recentAnalyses: RecentAnalysis[]): void
}
