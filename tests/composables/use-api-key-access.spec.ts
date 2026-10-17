import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { ApiKeyAccessDomain } from '~/domain/models/domains/api-key-access-domain'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { createApplicationStack } from '../fixtures/application-stack'

const mountConsumers = (stack: ReturnType<typeof createApplicationStack>) => {
  const consumers: ReturnType<typeof useApiKeyAccess>[] = []
  const Consumer = defineComponent({
    setup() {
      consumers.push(useApiKeyAccess())
      return () => h('p')
    },
  })
  mount(Consumer, { global: { provide: stack.provide } })
  mount(Consumer, { global: { provide: stack.provide } })
  return consumers
}

describe('useApiKeyAccess', () => {
  it('shares the API key access across the console', async () => {
    const stack = createApplicationStack('key')
    stack.apiKeyProxy.getApiKeyStatus.mockResolvedValue(new ApiKeyStatus('我的研究', 'active'))
    const [first, second] = mountConsumers(stack)
    expect(second?.isChecking.value).toBe(false)

    const refreshing = first?.refresh()
    expect(second?.isChecking.value).toBe(true)
    await refreshing
    await flushPromises()

    expect(second?.apiKeyAccess.value?.status.label).toBe('已啟用')
    expect(second?.isChecking.value).toBe(false)
  })

  it('replaces the API key access after an action on the API key page', () => {
    const [first, second] = mountConsumers(createApplicationStack())

    first?.replace(new ApiKeyAccessDomain(undefined, undefined).toDto())

    expect(second?.apiKeyAccess.value?.state).toBe('missing')
  })
})
