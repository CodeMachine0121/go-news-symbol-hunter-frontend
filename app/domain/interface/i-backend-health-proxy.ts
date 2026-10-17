export interface IBackendHealthProxy {
  checkHealth(): Promise<boolean>
}
