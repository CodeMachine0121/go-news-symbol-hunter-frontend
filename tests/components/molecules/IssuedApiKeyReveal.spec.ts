import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import IssuedApiKeyReveal from '~/components/molecules/IssuedApiKeyReveal.vue'
import { ApiKeyAccessDomain } from '~/domain/models/domains/api-key-access-domain'
import { IssuedApiKeyDto } from '~/domain/models/dto/issued-api-key-dto'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'

describe('IssuedApiKeyReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the full API key once with a reminder and copies it', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const wrapper = mount(IssuedApiKeyReveal, {
      props: { issuedApiKey: new IssuedApiKeyDto('full-key', new ApiKeyAccessDomain('full-key', new ApiKeyStatus('我的研究', 'inactive')).toDto()) },
    })

    expect(wrapper.text()).toContain('full-key')
    expect(wrapper.text()).toContain('請立即保存，離開後將無法再次查看')
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(writeText).toHaveBeenCalledWith('full-key')
    expect(wrapper.find('button').text()).toBe('已複製')
  })
})
