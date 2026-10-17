import type { IBackendHealthProxy } from '~/domain/interface/i-backend-health-proxy'
import { BackendHealthDomain } from '~/domain/models/domains/backend-health-domain'
import type { BackendHealthDto } from '~/domain/models/dto/backend-health-dto'

export class BackendHealthService {
  constructor(private readonly backendHealthProxy: IBackendHealthProxy) {}

  async checkHealth(): Promise<BackendHealthDto> {
    const isReachable = await this.backendHealthProxy.checkHealth()
    return new BackendHealthDomain(isReachable).toDto()
  }
}
