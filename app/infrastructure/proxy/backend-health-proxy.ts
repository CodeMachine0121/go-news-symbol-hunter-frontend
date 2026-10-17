import type { IBackendHealthProxy } from '~/domain/interface/i-backend-health-proxy'
import type { BackendHttpProxy } from '~/infrastructure/proxy/backend-http-proxy'

export class BackendHealthProxy implements IBackendHealthProxy {
  constructor(private readonly backendHttpProxy: BackendHttpProxy) {}

  async checkHealth(): Promise<boolean> {
    return this.backendHttpProxy.request<unknown>('GET', '/health')
      .then(() => true)
      .catch(() => false)
  }
}
