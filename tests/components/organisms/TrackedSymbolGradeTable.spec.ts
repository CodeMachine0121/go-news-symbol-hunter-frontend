import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TrackedSymbolGradeTable from '~/components/organisms/TrackedSymbolGradeTable.vue'
import { createTrackedSymbolGrade } from '../../fixtures/entity-fixtures'

describe('TrackedSymbolGradeTable', () => {
  it.each([
    { case: 'with its name', symbolName: '台積電', symbolLabel: '2330 台積電' },
    { case: 'without a name', symbolName: '', symbolLabel: '2330' },
  ])('shows the tracked symbol $case', ({ symbolName, symbolLabel }) => {
    const wrapper = mount(TrackedSymbolGradeTable, { props: { trackedSymbolGrades: [createTrackedSymbolGrade(['preMarket'], symbolName).toDomain().toDto()] } })

    expect(wrapper.find('strong').text()).toBe(symbolLabel)
  })

  it('lists the combined grade of each tracked symbol', () => {
    const text = mount(TrackedSymbolGradeTable, { props: { trackedSymbolGrades: [createTrackedSymbolGrade().toDomain().toDto()] } }).text()

    for (const fragment of ['2330', '台股', '2026-10-16', '看多', '0.85', '70', '2026-10-16 13:00']) {
      expect(text).toContain(fragment)
    }
  })

  it('expands to the session grades and collapses again', async () => {
    const wrapper = mount(TrackedSymbolGradeTable, { props: { trackedSymbolGrades: [createTrackedSymbolGrade().toDomain().toDto()] } })

    await wrapper.find('button').trigger('click')
    const sessionHeadings = wrapper.findAll('h3')
    const sessionTexts = sessionHeadings.map(heading => heading.element.parentElement?.textContent ?? '')

    expect(sessionHeadings.map(heading => heading.text())).toEqual(['盤前', '盤中', '盤後'])
    expect(sessionTexts[0]).toContain('preMarket 理由')
    expect(sessionTexts[1]).toContain('信心 70')
    expect(sessionTexts[2]).toContain('尚未產生')
    await wrapper.find('button').trigger('click')
    expect(wrapper.findAll('h3')).toHaveLength(0)
  })

  it('says there are no tracked symbol grades', () => {
    expect(mount(TrackedSymbolGradeTable, { props: { trackedSymbolGrades: [] } }).text()).toContain('目前沒有追蹤標的評等')
  })
})
