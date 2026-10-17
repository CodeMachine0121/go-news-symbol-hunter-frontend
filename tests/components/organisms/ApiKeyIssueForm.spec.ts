import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ApiKeyIssueForm from '~/components/organisms/ApiKeyIssueForm.vue'
import { IssueApiKeyDto } from '~/domain/models/dto/issue-api-key-dto'

describe('ApiKeyIssueForm', () => {
  it('asks to issue an API key with the typed name', async () => {
    const wrapper = mount(ApiKeyIssueForm, { props: { loading: false } })

    await wrapper.find('input').setValue('我的研究')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('issue')).toEqual([[new IssueApiKeyDto('我的研究')]])
  })
})
