import { config, RouterLinkStub } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.stubs = { NuxtLink: RouterLinkStub }
vi.stubGlobal('definePageMeta', () => undefined)
