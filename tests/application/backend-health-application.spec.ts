import { describe, expect, it } from 'vitest'
import { BackendHealthApplication } from '~/application/backend-health-application'
import { BackendHealthService } from '~/domain/service/backend-health-service'
import { mockBackendHealthProxy } from '../fixtures/proxy-mocks'

describe('BackendHealthApplication', () => {
  it.each([
    { isReachable: true, label: '服務連線正常' },
    { isReachable: false, label: '無法連線' },
  ])('shows 「$label」', async ({ isReachable, label }) => {
    const backendHealthProxy = mockBackendHealthProxy()
    backendHealthProxy.checkHealth.mockResolvedValue(isReachable)

    expect((await new BackendHealthApplication(new BackendHealthService(backendHealthProxy)).checkHealth()).status.label).toBe(label)
  })
})
