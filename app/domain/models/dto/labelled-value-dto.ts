export type Tone = 'positive' | 'negative' | 'neutral' | 'info' | 'warning'

export class LabelledValueDto {
  constructor(
    readonly value: string,
    readonly label: string,
    readonly tone: Tone = 'neutral',
  ) {}
}
