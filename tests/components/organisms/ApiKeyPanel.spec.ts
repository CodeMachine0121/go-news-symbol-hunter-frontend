import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ApiKeyPanel from '~/components/organisms/ApiKeyPanel.vue'
import { ApiKeyAccessDomain } from '~/domain/models/domains/api-key-access-domain'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'

const mountPanel = () => mount(ApiKeyPanel, {
  props: {
    apiKeyAccess: new ApiKeyAccessDomain('gsnh_1234567890abcdef', new ApiKeyStatus('我的研究', 'inactive')).toDto(),
    isChecking: false,
    isRevoking: false,
  },
})

const buttonNamed = (wrapper: ReturnType<typeof mountPanel>, name: string) => {
  const button = wrapper.findAll('button').find(candidate => candidate.text() === name)
  if (!button) {
    throw new Error(`no button named ${name}`)
  }
  return button
}

describe('ApiKeyPanel', () => {
  it('shows only the name, the masked API key and the status', () => {
    const text = mountPanel().text()

    expect(text).toContain('我的研究')
    expect(text).toContain('gsnh••••cdef')
    expect(text).toContain('停用中')
    expect(text).not.toContain('gsnh_1234567890abcdef')
  })

  it('revokes only after the user agrees in the confirmation', async () => {
    const wrapper = mountPanel()

    await buttonNamed(wrapper, '撤銷').trigger('click')
    expect(wrapper.emitted('revoke')).toBeUndefined()
    expect(wrapper.text()).toContain('永久失效')
    await buttonNamed(wrapper, '確認撤銷').trigger('click')

    expect(wrapper.emitted('revoke')).toHaveLength(1)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('does not revoke when the user cancels', async () => {
    const wrapper = mountPanel()

    await buttonNamed(wrapper, '撤銷').trigger('click')
    await buttonNamed(wrapper, '取消').trigger('click')

    expect(wrapper.emitted('revoke')).toBeUndefined()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('closes the confirmation when clicking outside or pressing escape', async () => {
    const wrapper = mountPanel()
    await buttonNamed(wrapper, '撤銷').trigger('click')
    await wrapper.find('[role="dialog"]').element.parentElement?.dispatchEvent(new MouseEvent('click'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    await buttonNamed(wrapper, '撤銷').trigger('click')
    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Escape' })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.emitted('revoke')).toBeUndefined()
  })

  it('shows no guidance for an active API key', () => {
    const wrapper = mount(ApiKeyPanel, {
      props: { apiKeyAccess: new ApiKeyAccessDomain('gsnh_1234567890abcdef', new ApiKeyStatus('我的研究', 'active')).toDto(), isChecking: false, isRevoking: false },
    })

    expect(wrapper.text()).toContain('已啟用')
    expect(wrapper.text()).not.toContain('administrator')
  })

  it('shows a dash for the name of an API key the service did not confirm', () => {
    const wrapper = mount(ApiKeyPanel, {
      props: { apiKeyAccess: new ApiKeyAccessDomain('gsnh_1234567890abcdef', new Error('offline')).toDto(), isChecking: false, isRevoking: false },
    })

    expect(wrapper.find('dd').text()).toBe('—')
    expect(wrapper.text()).toContain('服務暫時無法使用')
  })

  it.each([
    { name: '重新檢查', event: 'refresh' },
    { name: '在這個瀏覽器忘記', event: 'forget' },
  ])('asks to $event from 「$name」', async ({ name, event }) => {
    const wrapper = mountPanel()

    await buttonNamed(wrapper, name).trigger('click')

    expect(wrapper.emitted(event)).toHaveLength(1)
  })
})
