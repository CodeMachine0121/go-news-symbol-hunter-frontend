import type { TrackedSymbolGrade } from '~/domain/models/entities/tracked-symbol-grade'
import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'

export interface ITrackedSymbolGradeProxy {
  getTrackedSymbolGrades(symbolQuery: SymbolQueryVo | undefined, apiKey: string): Promise<TrackedSymbolGrade[]>
}
