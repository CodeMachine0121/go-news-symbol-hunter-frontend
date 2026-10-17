import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppButton from '~/components/atoms/AppButton.vue'

describe('AppButton', () => {
  it.each([
    { loading: false, disabled: false, isDisabled: false },
    { loading: true, disabled: false, isDisabled: true },
    { loading: false, disabled: true, isDisabled: true },
  ])('is disabled $isDisabled when loading $loading and disabled $disabled', ({ loading, disabled, isDisabled }) => {
    const button = mount(AppButton, { props: { loading, disabled }, slots: { default: '送出' } }).find('button')

    expect(button.element.disabled).toBe(isDisabled)
    expect(button.attributes('aria-busy')).toBe(String(loading))
  })

  it('cannot be clicked again while its action is in flight', async () => {
    const clicks: number[] = []
    const wrapper = mount(AppButton, { props: { loading: true }, attrs: { onClick: () => clicks.push(1) }, slots: { default: '送出' } })

    await wrapper.find('button').trigger('click')

    expect(clicks).toEqual([])
  })
})
