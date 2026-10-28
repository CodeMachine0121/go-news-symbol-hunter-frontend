export class SymbolLabelDomain {
  private readonly symbolName: string

  constructor(private readonly symbol: string, symbolName: string) {
    this.symbolName = symbolName.trim()
  }

  toText(): string {
    return this.toFileNameParts().join(' ')
  }

  toFileNameParts(): string[] {
    return this.symbolName === '' ? [this.symbol] : [this.symbol, this.symbolName]
  }
}
