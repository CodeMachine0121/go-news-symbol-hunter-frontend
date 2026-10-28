import { ofetch } from 'ofetch'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { SymbolAmbiguousError } from '~/domain/errors/symbol-ambiguous-error'
import { SymbolCandidateVo } from '~/domain/models/vo/symbol-candidate-vo'

type ErrorBodyWire = {
  error?: { code?: string, message?: string, candidates?: { symbol?: string | null, symbolName?: string | null }[] | null }
}

const SYMBOL_AMBIGUOUS_CODE = 'symbol_ambiguous'

type QueryWire = Record<string, string | undefined>

export class BackendResponse<T> {
  constructor(
    readonly status: number,
    readonly body: T,
  ) {}
}

export class BackendHttpProxy {
  constructor(private readonly baseUrl: string) {}

  async request<T>(method: 'GET' | 'POST' | 'DELETE', path: string, options: { apiKey?: string, query?: QueryWire, body?: object } = {}): Promise<BackendResponse<T>> {
    const response = await ofetch.raw<T | ErrorBodyWire>(path, {
      baseURL: this.baseUrl,
      method,
      query: options.query,
      body: options.body,
      headers: options.apiKey === undefined ? undefined : { 'X-API-Key': options.apiKey },
      retry: 0,
      ignoreResponseError: true,
    }).catch(() => {
      throw new BackendUnavailableError()
    })
    if (response.ok) {
      return new BackendResponse(response.status, response._data as T)
    }
    const errorDetail = (response._data as ErrorBodyWire | undefined)?.error
    if (errorDetail?.code === SYMBOL_AMBIGUOUS_CODE && errorDetail.message !== undefined) {
      const candidates = (errorDetail.candidates ?? [])
        .filter(candidate => typeof candidate.symbol === 'string' && candidate.symbol.trim() !== '')
        .map(candidate => new SymbolCandidateVo((candidate.symbol ?? '').trim(), candidate.symbolName ?? ''))
      throw new SymbolAmbiguousError(errorDetail.code, errorDetail.message, candidates)
    }
    if (errorDetail?.code !== undefined && errorDetail.message !== undefined && errorDetail.code !== 'service_unavailable') {
      throw new BackendRejectionError(errorDetail.code, errorDetail.message)
    }
    throw new BackendUnavailableError()
  }
}
