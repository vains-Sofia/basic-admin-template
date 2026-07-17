import { computed, getCurrentScope, markRaw, onScopeDispose } from 'vue'

import { useOverlayStore } from '@/stores/overlay'

import type { BasicDrawerCloseOptions, BasicDrawerController, BasicDrawerOptions } from './types'

const OVERLAY_KIND = 'drawer' as const
let drawerSequence = 0

function normalizeContent<T>(content: BasicDrawerOptions<T>['content']) {
  return typeof content === 'string' || !content ? content : markRaw(content)
}

function normalizeOptions<T>(options: BasicDrawerOptions<T>): Record<string, unknown> {
  return {
    cancelText: '取消',
    confirmText: '确定',
    closeOnConfirm: true,
    clearPayloadOnClose: true,
    ...options,
    content: normalizeContent(options.content),
  }
}

function normalizePartialOptions<T>(
  options: Partial<BasicDrawerOptions<T>>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...options }
  if ('content' in options) normalized.content = normalizeContent(options.content)
  return normalized
}

export function createBasicDrawerController<T = unknown>(
  drawerKey: string,
): BasicDrawerController<T> {
  const overlayStore = useOverlayStore()
  const state = overlayStore.getState(OVERLAY_KIND, drawerKey)
  const visible = computed(() => state.visible)
  const loading = computed(() => state.loading)
  const payload = computed(() => state.payload as T | undefined)

  function open(nextPayload?: T): void {
    overlayStore.open(OVERLAY_KIND, drawerKey, nextPayload)
  }

  function close(options: BasicDrawerCloseOptions = {}): void {
    overlayStore.close(OVERLAY_KIND, drawerKey, options.clearPayload)
  }

  function toggle(nextPayload?: T): void {
    if (state.visible) close()
    else open(nextPayload)
  }

  function setLoading(nextLoading: boolean): void {
    overlayStore.setLoading(OVERLAY_KIND, drawerKey, nextLoading)
  }

  function setPayload(nextPayload: T | undefined): void {
    overlayStore.setPayload(OVERLAY_KIND, drawerKey, nextPayload)
  }

  function setOptions(options: Partial<BasicDrawerOptions<T>>): void {
    overlayStore.setOptions(OVERLAY_KIND, drawerKey, normalizePartialOptions(options))
  }

  function clearPayload(): void {
    overlayStore.clearPayload(OVERLAY_KIND, drawerKey)
  }

  function destroy(): void {
    overlayStore.remove(OVERLAY_KIND, drawerKey)
  }

  return {
    drawerKey,
    visible,
    loading,
    payload,
    open,
    close,
    toggle,
    setLoading,
    setPayload,
    setOptions,
    clearPayload,
    destroy,
  }
}

export function useBasicDrawer<T = unknown>(
  options: BasicDrawerOptions<T> | string = {},
): BasicDrawerController<T> {
  const normalizedOptions = typeof options === 'string' ? { drawerKey: options } : options
  const drawerKey = normalizedOptions.drawerKey ?? `basic-drawer-${++drawerSequence}`
  const overlayStore = useOverlayStore()
  const controller = createBasicDrawerController<T>(drawerKey)

  overlayStore.register(OVERLAY_KIND, drawerKey, normalizeOptions(normalizedOptions))

  if (getCurrentScope()) {
    onScopeDispose(() => controller.destroy())
  }

  return controller
}
