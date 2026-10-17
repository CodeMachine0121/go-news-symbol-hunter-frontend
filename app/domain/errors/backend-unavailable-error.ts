export class BackendUnavailableError extends Error {
  constructor() {
    super('服務暫時無法使用')
  }
}
