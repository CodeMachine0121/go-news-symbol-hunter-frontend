import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RequestErrorAlert from '~/components/molecules/RequestErrorAlert.vue'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'
import { BackendUnavailableError } from '~/domain/errors/backend-unavailable-error'
import { InvalidInputError } from '~/domain/errors/invalid-input-error'

describe('RequestErrorAlert', () => {
  it('offers a retry when the service cannot be reached', async () => {
    const wrapper = mount(RequestErrorAlert, { props: { error: new BackendUnavailableError() } })

    expect(wrapper.text()).toContain('服務暫時無法使用')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('links to the API key settings for an API key problem', () => {
    const wrapper = mount(RequestErrorAlert, { props: { error: new BackendRejectionError('api_key_invalid', 'API key 無效') } })

    expect(wrapper.text()).toContain('API key 無效')
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/api-key')
  })

  it.each([
    new BackendRejectionError('symbol_not_found', '找不到此標的'),
    new InvalidInputError('請輸入標的'),
  ])('only shows the reason of $message', (error) => {
    const wrapper = mount(RequestErrorAlert, { props: { error } })

    expect(wrapper.text()).toBe(error.message)
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
