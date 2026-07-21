import { computed, readonly, ref } from 'vue'

const pendingCount = ref(0)

export const pendingRequestCount = readonly(pendingCount)
export const isRequestLoading = computed(() => pendingCount.value > 0)

export function startRequest(): void {
  pendingCount.value += 1
}

export function finishRequest(): void {
  pendingCount.value = Math.max(0, pendingCount.value - 1)
}

export function resetRequestStatus(): void {
  pendingCount.value = 0
}
