import { LabelledValueDto } from '~/domain/models/dto/labelled-value-dto'

export type MarketCategory = 'twStock' | 'usStock' | 'crypto'

export const MARKET_CATEGORIES: MarketCategory[] = ['twStock', 'usStock', 'crypto']

const MARKET_CATEGORY_LABELS: Record<MarketCategory, string> = {
  twStock: '台股',
  usStock: '美股',
  crypto: '加密貨幣',
}

export class MarketCategoryDomain {
  constructor(private readonly rawCategory: string) {}

  toDto(): LabelledValueDto {
    const category = MARKET_CATEGORIES.find(candidate => candidate === this.rawCategory)
    return new LabelledValueDto(this.rawCategory, category ? MARKET_CATEGORY_LABELS[category] : this.rawCategory)
  }
}
