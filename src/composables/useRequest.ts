import { computed, getCurrentInstance, onBeforeUnmount, ref, shallowRef } from 'vue'

import { normalizeError, type NormalizedError } from '@/utils/error'

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseRequestOptions<T, Args extends unknown[]> {
  immediate?: boolean
  initialArgs?: Args
  initialData?: T
  isEmpty?: (data: T | undefined) => boolean
  onSuccess?: (data: T) => void
  onError?: (error: NormalizedError) => void
}

export function useRequest<T, Args extends unknown[] = []>(
  executor: (...args: Args) => Promise<T>,
  options: UseRequestOptions<T, Args> = {},
) {
  const data = shallowRef<T | undefined>(options.initialData)
  const error = shallowRef<NormalizedError>()
  const status = ref<RequestStatus>('idle')
  const loading = computed(() => status.value === 'loading')
  const empty = computed(() => status.value === 'success' && (options.isEmpty?.(data.value) ?? false))

  let requestId = 0
  let lastArgs: Args | undefined = options.initialArgs

  async function execute(...args: Args): Promise<T> {
    const currentRequestId = ++requestId
    lastArgs = args
    status.value = 'loading'
    error.value = undefined

    try {
      const result = await executor(...args)
      if (currentRequestId !== requestId) return result
      data.value = result
      status.value = 'success'
      options.onSuccess?.(result)
      return result
    } catch (cause) {
      const normalized = normalizeError(cause)
      if (currentRequestId === requestId && !normalized.canceled) {
        error.value = normalized
        status.value = 'error'
        options.onError?.(normalized)
      }
      throw cause
    }
  }

  function refresh(): Promise<T> {
    return execute(...(lastArgs ?? ([] as unknown as Args)))
  }

  function cancel(): void {
    requestId += 1
    if (status.value === 'loading') status.value = 'idle'
  }

  function reset(): void {
    requestId += 1
    data.value = options.initialData
    error.value = undefined
    status.value = 'idle'
  }

  if (options.immediate) void execute(...(options.initialArgs ?? ([] as unknown as Args))).catch(() => undefined)
  if (getCurrentInstance()) onBeforeUnmount(cancel)

  return {
    data,
    error,
    status,
    loading,
    empty,
    execute,
    refresh,
    cancel,
    reset,
  }
}
