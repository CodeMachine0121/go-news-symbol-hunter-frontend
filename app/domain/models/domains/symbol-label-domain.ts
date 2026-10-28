export class SymbolLabelDomain {
  private readonly symbolName: string

  constructor(private readonly symbol: string, symbolName: string) {
    this.symbolName = symbolName.trim()
  }

  toText(): string {
    return this.symbolName === '' ? this.symbol : `${this.symbol} ${this.symbolName}`
  }

  toFileNameParts(): string[] {
    // a browser reads a period as the start of an extension and rewrites path characters, so the file name keeps neither
    const fileNameSymbolName = this.symbolName.replace(/[.\\/:*?"<>|]/g, '').trim()
    return fileNameSymbolName === '' ? [this.symbol] : [this.symbol, fileNameSymbolName]
  }
}
