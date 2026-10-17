const API_KEY_PROBLEM_CODES = ['api_key_missing', 'api_key_invalid', 'api_key_inactive']

export class BackendRejectionError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }

  get isApiKeyProblem(): boolean {
    return API_KEY_PROBLEM_CODES.includes(this.code)
  }
}
