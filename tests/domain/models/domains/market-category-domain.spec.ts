import { describe, expect, it } from 'vitest'
import { MarketCategoryDomain } from '~/domain/models/domains/market-category-domain'

describe('MarketCategoryDomain', () => {
  it.each([
    { category: 'twStock', label: '台股' },
    { category: 'usStock', label: '美股' },
    { category: 'crypto', label: '加密貨幣' },
    { category: 'forex', label: 'forex' },
  ])('market category $category → $label', ({ category, label }) => {
    expect(new MarketCategoryDomain(category).toDto()).toMatchObject({ value: category, label, tone: 'neutral' })
  })
})
