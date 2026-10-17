import type { BackendHealthDto } from '~/domain/models/dto/backend-health-dto'
import type { BackendHealthService } from '~/domain/service/backend-health-service'

export class BackendHealthApplication {
  constructor(private readonly backendHealthService: BackendHealthService) {}

  checkHealth(): Promise<BackendHealthDto> {
    return this.backendHealthService.checkHealth()
  }
}
