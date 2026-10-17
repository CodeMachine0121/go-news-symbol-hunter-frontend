import { readonly, ref, shallowReadonly, shallowRef } from 'vue'
import { useApiKeyAccess } from '~/composables/use-api-key-access'
import { BackendRejectionError } from '~/domain/errors/backend-rejection-error'

export function useRequest<TArguments extends unknown[], TResult>(operation: (...operationArguments: TArguments) => Promise<TResult>) {
  const { refresh } = useApiKeyAccess()
  const data = shallowRef<TResult>()
  const error = shallowRef<Error>()
  const isRunning = ref(false)
  let lastArguments: TArguments | undefined

  const run = async (...operationArguments: TArguments): Promise<void> => {
    lastArguments = operationArguments
    isRunning.value = true
    error.value = undefined
    try {
      data.value = await operation(...operationArguments)
    }
    catch (caught: unknown) {
      data.value = undefined
      error.value = caught instanceof Error ? caught : new Error(String(caught))
      if (caught instanceof BackendRejectionError && caught.isApiKeyProblem) {
        void refresh()
      }
    }
    finally {
      isRunning.value = false
    }
  }

  const reset = (): void => {
    data.value = undefined
    error.value = undefined
  }

  const retry = async (): Promise<void> => {
    if (lastArguments !== undefined) {
      await run(...lastArguments)
    }
  }

  return { data: shallowReadonly(data), error: shallowReadonly(error), isRunning: readonly(isRunning), run, retry, reset }
}
