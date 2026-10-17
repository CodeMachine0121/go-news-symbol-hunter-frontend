import { inject, type InjectionKey } from 'vue'

export function useApplication<T>(key: InjectionKey<T>): T {
  const application = inject(key)
  if (application === undefined) {
    throw new Error(`${String(key.description)} is not provided`)
  }
  return application
}
