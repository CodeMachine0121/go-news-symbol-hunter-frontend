import type { SessionGrade } from '~/domain/models/entities/session-grade'
import { TrackedSymbolGradeDomain } from '~/domain/models/domains/tracked-symbol-grade-domain'

export class TrackedSymbolGrade {
  constructor(
    readonly symbol: string,
    readonly symbolName: string,
    readonly category: string,
    readonly tradingDay: string,
    readonly grade: string,
    readonly combinedScore: number,
    readonly confidence: number,
    readonly updatedAt: Date,
    readonly sessionGrades: SessionGrade[],
  ) {}

  toDomain(): TrackedSymbolGradeDomain {
    return new TrackedSymbolGradeDomain(this)
  }
}
