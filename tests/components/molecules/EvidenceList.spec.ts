import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EvidenceList from '~/components/molecules/EvidenceList.vue'
import { EvidenceDto } from '~/domain/models/dto/evidence-dto'

const evidence = [new EvidenceDto('法說會上修財測', 'https://news.example/1', '鉅亨網', '2026-10-15 16:00')]

describe('EvidenceList', () => {
  it.each([
    { case: 'on screen', showLink: false, printedAddresses: [] },
    { case: 'on paper', showLink: true, printedAddresses: ['https://news.example/1'] },
  ])('prints the evidence address only $case', ({ showLink, printedAddresses }) => {
    const wrapper = mount(EvidenceList, { props: { evidence, showLink } })

    expect(wrapper.find('a').attributes('href')).toBe('https://news.example/1')
    expect(wrapper.text()).toContain('鉅亨網・2026-10-15 16:00')
    expect(wrapper.findAll('.evidence-list__link').map(link => link.text())).toEqual(printedAddresses)
  })
})
