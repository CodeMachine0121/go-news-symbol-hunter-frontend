import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useRequest } from '~/composables/use-request'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { createApplicationStack } from '../fixtures/application-stack'

const mountRequest = (operation: (symbol: string) => Promise<string>, stack = createApplicationStack('key')) => {
  const exposed: { request?: ReturnType<typeof useRequest<[string], string>> } = {}
  mount(defineComponent({
    setup() {
      exposed.request = useRequest(operation)
      return () => h('p')
    },
  }), { global: { provide: stack.provide } })
  if (!exposed.request) {
    throw new Error('request not created')
  }
  return { request: exposed.request, stack }
}

describe('useRequest', () => {
  it('keeps the result and reports running only while the request is in flight', async () => {
    const operation = vi.fn((symbol: string) => Promise.resolve(`${symbol} 的新聞`))
    const { request } = mountRequest(operation)
    expect(request.isRunning.value).toBe(false)

    const running = request.run('2330')
    expect(request.isRunning.value).toBe(true)
    await running

    expect(request.isRunning.value).toBe(false)
    expect(request.data.value).toBe('2330 的新聞')
    expect(request.error.value).toBeUndefined()
    expect(operation).toHaveBeenCalledWith('2330')
  })

  it.each([
    { case: 'a backend rejection', failure: new BackendRejectionError('symbol_not_found', '找不到此標的'), message: '找不到此標的' },
    { case: 'an unreachable service', failure: new BackendUnavailableError(), message: '服務暫時無法使用' },
    { case: 'a non-error failure', failure: 'boom', message: 'boom' },
  ])('reports $case and drops the previous result', async ({ failure, message }) => {
    const operation = vi.fn<(symbol: string) => Promise<string>>().mockResolvedValueOnce('舊結果').mockRejectedValueOnce(failure)
    const { request, stack } = mountRequest(operation)

    await request.run('2330')
    await request.run('9999')

    expect(request.data.value).toBeUndefined()
    expect(request.error.value?.message).toBe(message)
    expect(request.isRunning.value).toBe(false)
    expect(stack.apiKeyProxy.getApiKeyStatus).not.toHaveBeenCalled()
  })

  it('rechecks the API key when the service rejects it', async () => {
    const { request, stack } = mountRequest(() => Promise.reject(new BackendRejectionError('api_key_invalid', 'API key 無效')))
    stack.apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('我的研究', 'active'))

    await request.run('2330')
    await flushPromises()

    expect(request.error.value?.message).toBe('API key 無效')
    expect(stack.apiKeyProxy.getApiKeyStatus).toHaveBeenCalledWith('key')
  })

  it('retries with the last arguments and clears the previous error', async () => {
    const operation = vi.fn<(symbol: string) => Promise<string>>().mockRejectedValueOnce(new BackendUnavailableError()).mockResolvedValueOnce('新聞')
    const { request } = mountRequest(operation)

    await request.run('2330')
    await request.retry()

    expect(operation).toHaveBeenLastCalledWith('2330')
    expect(request.data.value).toBe('新聞')
    expect(request.error.value).toBeUndefined()
  })

  it('has nothing to retry before the first request', async () => {
    const operation = vi.fn((symbol: string) => Promise.resolve(symbol))
    const { request } = mountRequest(operation)

    await request.retry()

    expect(operation).not.toHaveBeenCalled()
  })

  it('forgets the result and the error on reset', async () => {
    const operation = vi.fn<(symbol: string) => Promise<string>>().mockResolvedValueOnce('新聞').mockRejectedValueOnce(new BackendUnavailableError())
    const { request } = mountRequest(operation)
    await request.run('2330')
    request.reset()
    expect(request.data.value).toBeUndefined()

    await request.run('2330')
    request.reset()

    expect(request.error.value).toBeUndefined()
  })
})
