import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConsoleLayout from '~/components/templates/ConsoleLayout.vue'

describe('ConsoleLayout', () => {
  it('opens the navigation from the menu button and closes it after choosing a link', async () => {
    const wrapper = mount(ConsoleLayout, { slots: { navigation: '<a href="/news">新聞搜尋</a>', default: '<p>內容</p>' } })
    const menu = wrapper.find('button')

    await menu.trigger('click')
    expect(menu.attributes('aria-expanded')).toBe('true')
    await wrapper.find('a').trigger('click')

    expect(menu.attributes('aria-expanded')).toBe('false')
    expect(wrapper.text()).toContain('內容')
  })
})
