import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { SymbolLabelDomain } from '~/domain/models/domains/symbol-label-domain'
import { SymbolCandidateDto } from '~/domain/models/dto/symbol-candidate-dto'
import type { SymbolCandidateVo } from '~/domain/models/vo/symbol-candidate-vo'

export class SymbolAmbiguousError extends BackendRejectionError {
  constructor(
    code: string,
    message: string,
    private readonly candidates: SymbolCandidateVo[],
  ) {
    super(code, message)
  }

  toCandidateDtos(): SymbolCandidateDto[] {
    return this.candidates.map(candidate => new SymbolCandidateDto(candidate.symbol, new SymbolLabelDomain(candidate.symbol, candidate.symbolName).toText()))
  }
}
