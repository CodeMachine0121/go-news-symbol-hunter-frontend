import type { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'

export class GradeBacktestQueryVo {
  constructor(
    readonly completedFrom: string | undefined,
    readonly completedTo: string | undefined,
    readonly symbolQuery: SymbolQueryVo | undefined,
    readonly source: string | undefined,
  ) {}
}
