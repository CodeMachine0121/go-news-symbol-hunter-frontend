import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AnalysisEventStatusPanel from '~/components/organisms/AnalysisEventStatusPanel.vue'
import { STARTED_AT, createAnalysisEvent } from '../../fixtures/entity-fixtures'

const mountPanel = (status: string, minutesAfterStart: number) => mount(AnalysisEventStatusPanel, {
  props: {
    analysisEvent: createAnalysisEvent({ status, failureReason: 'AI 服務暫時無法使用' }).toDomain().toDto(new Date(STARTED_AT.getTime() + minutesAfterStart * 60 * 1000)),
  },
})

describe('AnalysisEventStatusPanel', () => {
  it('shows the symbol with its name', () => {
    const wrapper = mount(AnalysisEventStatusPanel, {
      props: { analysisEvent: createAnalysisEvent({ symbol: '2330', symbolName: '台積電', category: 'twStock' }).toDomain().toDto(STARTED_AT) },
    })

    expect(wrapper.text()).toContain('台股 2330 台積電')
  })

  it('shows 分析中 while waiting', () => {
    const wrapper = mountPanel('running', 1)

    expect(wrapper.text()).toContain('分析中')
    expect(wrapper.text()).toContain('加密貨幣 BTC')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('shows the failure reason and offers to start again', async () => {
    const wrapper = mountPanel('failed', 1)

    expect(wrapper.text()).toContain('分析失敗：AI 服務暫時無法使用')
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('button').text()).toBe('重新發起')
    expect(wrapper.emitted('restart')).toHaveLength(1)
  })

  it('asks for a manual refresh after waiting too long', async () => {
    const wrapper = mountPanel('running', 16)

    expect(wrapper.text()).toContain('等候時間過長，請稍後手動重新整理')
    expect(wrapper.text()).not.toContain('每 3 秒自動更新')
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('button').text()).toBe('重新整理')
    expect(wrapper.emitted('refresh')).toHaveLength(1)
  })
})
