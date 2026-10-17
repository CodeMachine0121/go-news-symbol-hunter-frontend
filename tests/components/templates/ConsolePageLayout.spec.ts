import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsolePageLayout from '~/components/templates/ConsolePageLayout.vue'

describe('ConsolePageLayout', () => {
  it('stacks the page content', () => {
    expect(mount(ConsolePageLayout, { slots: { default: '<h1>頁面</h1>' } }).find('h1').text()).toBe('頁面')
  })
})
