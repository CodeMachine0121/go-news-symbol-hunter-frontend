import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BackendStatusIndicator from '~/components/molecules/BackendStatusIndicator.vue'
import { BackendHealthDomain } from '~/domain/models/domains/backend-health-domain'

describe('BackendStatusIndicator', () => {
  it.each([
    { backendHealth: new BackendHealthDomain(true).toDto(), text: '服務連線正常' },
    { backendHealth: new BackendHealthDomain(false).toDto(), text: '無法連線' },
    { backendHealth: undefined, text: '檢查中' },
  ])('shows 「$text」', ({ backendHealth, text }) => {
    expect(mount(BackendStatusIndicator, { props: { backendHealth } }).text()).toBe(text)
  })
})
