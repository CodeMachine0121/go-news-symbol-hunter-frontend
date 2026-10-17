import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ApiKeyUseForm from '~/components/organisms/ApiKeyUseForm.vue'

describe('ApiKeyUseForm', () => {
  it('asks to use the pasted API key', async () => {
    const wrapper = mount(ApiKeyUseForm, { props: { loading: false } })

    await wrapper.find('input').setValue('full-key')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('use')).toEqual([['full-key']])
  })
})
