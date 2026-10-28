import type { IRecentAnalysisStorageProxy } from '~/domain/interface/i-recent-analysis-storage-proxy'
import { RecentAnalysis } from '~/domain/models/entities/recent-analysis'

const RECENT_ANALYSES_STORAGE_KEY = 'go-symbol-news-hunter.recent-analyses'

type RecentAnalysisWire = {
  analysisEventId: number
  symbol: string
  // analyses remembered before symbol names existed have none
  symbolName?: unknown
  category: string
  startedAt: string
}

export class LocalStorageRecentAnalysisStorageProxy implements IRecentAnalysisStorageProxy {
  read(): RecentAnalysis[] {
    try {
      const recentAnalyses = JSON.parse(localStorage.getItem(RECENT_ANALYSES_STORAGE_KEY) ?? '[]') as RecentAnalysisWire[]
      return recentAnalyses.map(recentAnalysis => new RecentAnalysis(
        recentAnalysis.analysisEventId,
        recentAnalysis.symbol,
        // hand-edited or older browser data may hold anything here
        typeof recentAnalysis.symbolName === 'string' ? recentAnalysis.symbolName : '',
        recentAnalysis.category,
        new Date(recentAnalysis.startedAt),
      ))
    }
    catch {
      return []
    }
  }

  save(recentAnalyses: RecentAnalysis[]): void {
    const recentAnalysesWire: RecentAnalysisWire[] = recentAnalyses.map(recentAnalysis => ({
      analysisEventId: recentAnalysis.analysisEventId,
      symbol: recentAnalysis.symbol,
      symbolName: recentAnalysis.symbolName,
      category: recentAnalysis.category,
      startedAt: recentAnalysis.startedAt.toISOString(),
    }))
    localStorage.setItem(RECENT_ANALYSES_STORAGE_KEY, JSON.stringify(recentAnalysesWire))
  }
}
