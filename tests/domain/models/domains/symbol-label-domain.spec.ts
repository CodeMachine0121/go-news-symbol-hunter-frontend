import { describe, expect, it } from 'vitest'
import { SymbolLabelDomain } from '~/domain/models/domains/symbol-label-domain'

describe('SymbolLabelDomain', () => {
  it.each([
    { case: 'a Taiwan stock with its name', symbol: '2330', symbolName: '台積電', text: '2330 台積電', fileNameParts: ['2330', '台積電'] },
    { case: 'a US stock with its name', symbol: 'AAPL', symbolName: 'Apple Inc.', text: 'AAPL Apple Inc.', fileNameParts: ['AAPL', 'Apple Inc.'] },
    { case: 'a name with stray spaces', symbol: '2330', symbolName: '  台積電 ', text: '2330 台積電', fileNameParts: ['2330', '台積電'] },
    { case: 'an empty name', symbol: '2317', symbolName: '', text: '2317', fileNameParts: ['2317'] },
    { case: 'a name of only spaces', symbol: '2330', symbolName: '   ', text: '2330', fileNameParts: ['2330'] },
  ])('writes $case as "$text"', ({ symbol, symbolName, text, fileNameParts }) => {
    const symbolLabel = new SymbolLabelDomain(symbol, symbolName)

    expect(symbolLabel.toText()).toBe(text)
    expect(symbolLabel.toFileNameParts()).toEqual(fileNameParts)
  })
})
