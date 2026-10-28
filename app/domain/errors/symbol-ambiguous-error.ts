import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { SymbolLabelDomain } from '~/domain/models/domains/symbol-label-domain'
import { SymbolCandidateDto } from '~/domain/models/dto/symbol-candidate-dto'
import type { SymbolCandidateVo } from '~/domain/models/vo/symbol-candidate-vo'

export class SymbolAmbiguousError extends BackendRejectionError {
  readonly candidates: SymbolCandidateDto[]

  constructor(code: string, message: string, candidates: SymbolCandidateVo[]) {
    super(code, message)
    this.candidates = candidates.map(candidate => new SymbolCandidateDto(candidate.symbol, new SymbolLabelDomain(candidate.symbol, candidate.symbolName).toText()))
  }
}
