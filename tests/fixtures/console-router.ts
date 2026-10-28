import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, RouterView, useRoute } from 'vue-router'
import AnalysisEventPage from '~/pages/analysis-events/[analysisEventId]/index.vue'
import AnalysisReportPage from '~/pages/analysis-events/[analysisEventId]/report.vue'
import AnalysisEventsPage from '~/pages/analysis-events/index.vue'
import { ApiKeyStatus } from '~/domain/models/entities/api-key-status'
import { createApplicationStack } from './application-stack'

const KeyedRouterView = defineComponent({
  setup() {
    const route = useRoute()
    return () => h(RouterView, { key: route.fullPath })
  },
})

export const mountAnalysisRoutes = async (
  initialPath: string,
  { storedApiKey, apiKeyStatus }: { storedApiKey?: string, apiKeyStatus: ApiKeyStatus | Error } = { storedApiKey: 'key', apiKeyStatus: new ApiKeyStatus('我的研究', 'active') },
) => {
  const stack = createApplicationStack(storedApiKey)
  if (apiKeyStatus instanceof Error) {
    stack.apiKeyProxy.getApiKeyStatus.mockRejectedValue(apiKeyStatus)
  }
  else {
    stack.apiKeyProxy.getApiKeyStatus.mockResolvedValue(apiKeyStatus)
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/analysis-events', component: AnalysisEventsPage },
      { path: '/analysis-events/:analysisEventId', component: AnalysisEventPage },
      { path: '/analysis-events/:analysisEventId/report', component: AnalysisReportPage },
    ],
  })
  await router.push(initialPath)
  await router.isReady()
  const wrapper = mount(KeyedRouterView, { global: { plugins: [router], provide: stack.provide } })
  await flushPromises()
  return { stack, router, wrapper }
}
