import type { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import type { KeyEvent } from '~/domain/models/entities/key-event'
import type { PriceAtAnalysis } from '~/domain/models/entities/price-at-analysis'

export class AnalysisResult {
  constructor(
    readonly grade: string,
    readonly confidence: number,
    readonly timeHorizon: string,
    readonly reason: string,
    readonly keyEvents: KeyEvent[],
    readonly riskFactors: string[],
    readonly evidence: AnalysisEvidence[],
    readonly priceAtAnalysis: PriceAtAnalysis | undefined,
    readonly createdAt: Date,
  ) {}
}
