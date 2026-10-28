import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReportLayout from '~/components/templates/ReportLayout.vue'

describe('ReportLayout', () => {
  it('puts the toolbar above the paper', () => {
    const wrapper = mount(ReportLayout, { slots: { toolbar: '<button>匯出 PDF</button>', default: '<article>報告</article>' } })

    expect(wrapper.find('.report-layout__toolbar button').text()).toBe('匯出 PDF')
    expect(wrapper.find('.report-layout__paper article').text()).toBe('報告')
  })
})
