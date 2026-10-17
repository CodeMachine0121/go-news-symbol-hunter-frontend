import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { API_KEY_APPLICATION } from '~/composables/application-injection-keys'
import { useApplication } from '~/composables/use-application'

describe('useApplication', () => {
  it('fails loudly when an application is not provided', () => {
    const Consumer = defineComponent({
      setup() {
        useApplication(API_KEY_APPLICATION)
        return () => h('p')
      },
    })

    expect(() => mount(Consumer)).toThrow('ApiKeyApplication is not provided')
  })
})
