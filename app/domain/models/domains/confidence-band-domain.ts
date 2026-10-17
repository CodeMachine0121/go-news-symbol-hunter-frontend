import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export const CONFIDENCE_BANDS = ['low', 'medium', 'high']

const CONFIDENCE_BAND_LABELS: Record<string, string> = {
  low: '低信心（0–49）',
  medium: '中信心（50–74）',
  high: '高信心（75–100）',
}

export class ConfidenceBandDomain {
  constructor(private readonly confidenceBand: string) {}

  toDto(): LabelledValueDto {
    return new LabelledValueDto(this.confidenceBand, CONFIDENCE_BAND_LABELS[this.confidenceBand] ?? this.confidenceBand)
  }
}
