import type { AnalysisEvidence } from '~/domain/models/entities/analysis-evidence'
import type { KeyEvent } from '~/domain/models/entities/key-event'

export class SessionGrade {
  constructor(
    readonly session: string,
    readonly grade: string,
    readonly confidence: number,
    readonly reason: string,
    readonly keyEvents: KeyEvent[],
    readonly riskFactors: string[],
    readonly evidence: AnalysisEvidence[],
    readonly createdAt: Date,
  ) {}
}
