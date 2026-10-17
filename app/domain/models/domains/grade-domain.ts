import { LabelledValueDto, type Tone } from '~/domain/models/dto/labelled-value-dto'

export type Grade = 'strongBullish' | 'bullish' | 'neutral' | 'bearish' | 'strongBearish'

export const GRADES: Grade[] = ['strongBullish', 'bullish', 'neutral', 'bearish', 'strongBearish']

const GRADE_LABELS: Record<Grade, string> = {
  strongBullish: '強烈看多',
  bullish: '看多',
  neutral: '中性',
  bearish: '看空',
  strongBearish: '強烈看空',
}

const GRADE_TONES: Record<Grade, Tone> = {
  strongBullish: 'positive',
  bullish: 'positive',
  neutral: 'neutral',
  bearish: 'negative',
  strongBearish: 'negative',
}

export class GradeDomain {
  readonly grade: Grade

  constructor(rawGrade: string) {
    this.grade = GRADES.find(grade => grade === rawGrade) ?? 'neutral'
  }

  toDto(): LabelledValueDto {
    return new LabelledValueDto(this.grade, GRADE_LABELS[this.grade], GRADE_TONES[this.grade])
  }
}
