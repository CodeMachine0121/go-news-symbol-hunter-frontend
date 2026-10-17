import { InvalidInputError } from '~/domain/errors/invalid-input-error'
import type { SymbolQueryDto } from '~/domain/models/dto/symbol-query-dto'
import { SymbolQueryVo } from '~/domain/models/vo/symbol-query-vo'

export class SymbolQueryDomain {
  private readonly symbol: string
  private readonly category: string

  constructor(symbolQuery: SymbolQueryDto) {
    this.symbol = symbolQuery.symbol.trim()
    this.category = symbolQuery.category.trim()
  }

  toRequiredQuery(): SymbolQueryVo {
    if (this.symbol === '') {
      throw new InvalidInputError('請輸入標的')
    }
    if (this.category === '') {
      throw new InvalidInputError('請選擇市場類別')
    }
    return new SymbolQueryVo(this.symbol, this.category)
  }

  toOptionalQuery(): SymbolQueryVo | undefined {
    if (this.symbol === '' && this.category === '') {
      return undefined
    }
    if (this.symbol === '' || this.category === '') {
      throw new InvalidInputError('標的與市場類別需一起提供')
    }
    return new SymbolQueryVo(this.symbol, this.category)
  }
}
