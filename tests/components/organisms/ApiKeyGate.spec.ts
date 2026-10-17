import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ApiKeyGate from '~/components/organisms/ApiKeyGate.vue'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { createApplicationStack } from '../../fixtures/application-stack'

const mountGate = async (storedApiKey?: string) => {
  const stack = createApplicationStack(storedApiKey)
  const mountWithStack = () => mount(ApiKeyGate, {
    global: { provide: stack.provide },
    slots: { default: '<form data-test="protected-form"><input aria-label="標的"><button>搜尋</button></form>' },
  })
  return { ...stack, mountWithStack }
}

const settingsLinkOf = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('a').find(link => link.text() === '前往 API key 設定')

describe('ApiKeyGate', () => {
  it('shows the protected form with an active API key', async () => {
    const { apiKeyProxy, mountWithStack } = await mountGate('key')
    apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('我的研究', 'active'))

    const wrapper = mountWithStack()
    await flushPromises()

    expect(wrapper.find('[data-test="protected-form"]').exists()).toBe(true)
  })

  it('guides to the settings when there is no API key', async () => {
    const { mountWithStack } = await mountGate()

    const wrapper = mountWithStack()
    await flushPromises()

    expect(wrapper.find('[data-test="protected-form"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('尚未設定 API key')
    expect(settingsLinkOf(wrapper)?.attributes('href') ?? wrapper.findComponent({ name: 'RouterLinkStub' }).props('to')).toBe('/api-key')
  })

  it('asks to wait for the administrator with an inactive API key', async () => {
    const { apiKeyProxy, mountWithStack } = await mountGate('key')
    apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('我的研究', 'inactive'))

    const wrapper = mountWithStack()
    await flushPromises()

    expect(wrapper.find('[data-test="protected-form"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('API key 尚未啟用，請等候 administrator 啟用')
    expect(wrapper.find('button').text()).toBe('重新檢查')
  })

  it('guides to the settings with an invalid API key', async () => {
    const { apiKeyProxy, mountWithStack } = await mountGate('key')
    apiKeyProxy.getApiKeyStatus.mockRejectedValue(new BackendRejectionError('api_key_invalid', 'API key 無效'))

    const wrapper = mountWithStack()
    await flushPromises()

    expect(wrapper.text()).toContain('API key 無效')
    expect(wrapper.findComponent({ name: 'RouterLinkStub' }).props('to')).toBe('/api-key')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('opens the protected form right after a successful recheck', async () => {
    const { apiKeyProxy, mountWithStack } = await mountGate('key')
    apiKeyProxy.getApiKeyStatus.mockResolvedValueOnce(new ApiKeyStatus('我的研究', 'inactive'))
    apiKeyProxy.getApiKeyStatus.mockResolvedValueOnce(new ApiKeyStatus('我的研究', 'active'))
    const wrapper = mountWithStack()
    await flushPromises()

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="protected-form"]').exists()).toBe(true)
  })

  it('offers a recheck without a settings link when the service is unreachable', async () => {
    const { apiKeyProxy, mountWithStack } = await mountGate('key')
    apiKeyProxy.getApiKeyStatus.mockRejectedValue(new BackendUnavailableError())

    const wrapper = mountWithStack()
    await flushPromises()

    expect(wrapper.text()).toContain('服務暫時無法使用')
    expect(wrapper.find('button').text()).toBe('重新檢查')
    expect(wrapper.findComponent({ name: 'RouterLinkStub' }).exists()).toBe(false)
  })

  it('reuses the API key access already known to the console', async () => {
    const { apiKeyProxy, mountWithStack } = await mountGate('key')
    apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('我的研究', 'active'))
    mountWithStack()
    await flushPromises()

    mountWithStack()
    await flushPromises()

    expect(apiKeyProxy.getApiKeyStatus).toHaveBeenCalledTimes(1)
  })
})
