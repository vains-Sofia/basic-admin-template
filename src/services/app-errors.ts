import { shallowRef } from 'vue'

import { normalizeError, type NormalizedError } from '@/utils/error'

export const globalAppError = shallowRef<NormalizedError>()

export function reportAppError(error: unknown, fallback?: string): void {
  const normalized = normalizeError(error, fallback)
  if (normalized.canceled) return
  globalAppError.value = normalized
}

export function clearAppError(): void {
  globalAppError.value = undefined
}
