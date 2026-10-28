import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export type GradeSource = 'manual' | 'background'

export const GRADE_SOURCES: GradeSource[] = ['manual', 'background']

const GRADE_SOURCE_LABELS: Record<GradeSource, string> = {
  manual: '手動',
  background: '背景',
}

export class GradeSourceDomain {
  constructor(private readonly rawSource: string) {}

  toDto(): LabelledValueDto {
    const source = GRADE_SOURCES.find(candidate => candidate === this.rawSource)
    return new LabelledValueDto(this.rawSource, source ? GRADE_SOURCE_LABELS[source] : this.rawSource)
  }
}
