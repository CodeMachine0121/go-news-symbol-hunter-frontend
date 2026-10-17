import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppPageHeader from '~/components/atoms/AppPageHeader.vue'

describe('AppPageHeader', () => {
  it('shows the title, the description and the actions', () => {
    const wrapper = mount(AppPageHeader, { props: { title: '標的分析', description: '說明' }, slots: { actions: '<a href="/">返回</a>' } })

    expect(wrapper.find('h1').text()).toBe('標的分析')
    expect(wrapper.text()).toContain('說明')
    expect(wrapper.find('a').text()).toBe('返回')
  })

  it('shows only the title when nothing else is given', () => {
    const wrapper = mount(AppPageHeader, { props: { title: '標的分析' } })

    expect(wrapper.text()).toBe('標的分析')
  })
})
