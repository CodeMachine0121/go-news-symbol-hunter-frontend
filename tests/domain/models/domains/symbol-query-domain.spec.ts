import { describe, expect, it } from 'vitest'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import { SymbolQueryDomain } from '~/domain/models/domains/symbol-query-domain'
import { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'

describe('SymbolQueryDomain', () => {
  it('trims a required query', () => {
    expect(new SymbolQueryDomain(new SymbolQueryDto(' 2330 ', ' twStock ')).toRequiredQuery()).toMatchObject({ symbol: '2330', category: 'twStock' })
  })

  it.each([
    { symbol: '  ', category: 'twStock', message: '請輸入標的' },
    { symbol: '2330', category: '', message: '請選擇市場類別' },
  ])('rejects a required query with symbol "$symbol" and category "$category"', ({ symbol, category, message }) => {
    expect(() => new SymbolQueryDomain(new SymbolQueryDto(symbol, category)).toRequiredQuery()).toThrow(new InvalidInputError(message))
  })

  it.each([
    { symbol: '', category: '', expected: undefined },
    { symbol: '2330', category: 'twStock', expected: { symbol: '2330', category: 'twStock' } },
  ])('accepts an optional query given together or not at all', ({ symbol, category, expected }) => {
    const symbolQuery = new SymbolQueryDomain(new SymbolQueryDto(symbol, category)).toOptionalQuery()

    expect(symbolQuery === undefined ? undefined : { symbol: symbolQuery.symbol, category: symbolQuery.category }).toEqual(expected)
  })

  it.each([
    { symbol: '2330', category: '' },
    { symbol: '', category: 'twStock' },
  ])('rejects an optional query with only one of symbol and category', ({ symbol, category }) => {
    expect(() => new SymbolQueryDomain(new SymbolQueryDto(symbol, category)).toOptionalQuery()).toThrow(new InvalidInputError('標的與市場類別需一起提供'))
  })
})
