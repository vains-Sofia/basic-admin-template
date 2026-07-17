import { computed, getCurrentScope, markRaw, onScopeDispose } from 'vue'

import { useOverlayStore } from '@/stores/overlay'

import type { BasicDialogCloseOptions, BasicDialogController, BasicDialogOptions } from './types'

const OVERLAY_KIND = 'dialog' as const
let dialogSequence = 0

function normalizeContent<T>(content: BasicDialogOptions<T>['content']) {
  return typeof content === 'string' || !content ? content : markRaw(content)
}

function normalizeOptions<T>(options: BasicDialogOptions<T>): Record<string, unknown> {
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
  options: Partial<BasicDialogOptions<T>>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = { ...options }
  if ('content' in options) normalized.content = normalizeContent(options.content)
  return normalized
}

export function createBasicDialogController<T = unknown>(
  dialogKey: string,
): BasicDialogController<T> {
  const overlayStore = useOverlayStore()
  const state = overlayStore.getState(OVERLAY_KIND, dialogKey)
  const visible = computed(() => state.visible)
  const loading = computed(() => state.loading)
  const payload = computed(() => state.payload as T | undefined)

  function open(nextPayload?: T): void {
    overlayStore.open(OVERLAY_KIND, dialogKey, nextPayload)
  }

  function close(options: BasicDialogCloseOptions = {}): void {
    overlayStore.close(OVERLAY_KIND, dialogKey, options.clearPayload)
  }

  function toggle(nextPayload?: T): void {
    if (state.visible) close()
    else open(nextPayload)
  }

  function setLoading(nextLoading: boolean): void {
    overlayStore.setLoading(OVERLAY_KIND, dialogKey, nextLoading)
  }

  function setPayload(nextPayload: T | undefined): void {
    overlayStore.setPayload(OVERLAY_KIND, dialogKey, nextPayload)
  }

  function setOptions(options: Partial<BasicDialogOptions<T>>): void {
    overlayStore.setOptions(OVERLAY_KIND, dialogKey, normalizePartialOptions(options))
  }

  function clearPayload(): void {
    overlayStore.clearPayload(OVERLAY_KIND, dialogKey)
  }

  function destroy(): void {
    overlayStore.remove(OVERLAY_KIND, dialogKey)
  }

  return {
    dialogKey,
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

export function useBasicDialog<T = unknown>(
  options: BasicDialogOptions<T> | string = {},
): BasicDialogController<T> {
  const normalizedOptions = typeof options === 'string' ? { dialogKey: options } : options
  const dialogKey = normalizedOptions.dialogKey ?? `basic-dialog-${++dialogSequence}`
  const overlayStore = useOverlayStore()
  const controller = createBasicDialogController<T>(dialogKey)

  overlayStore.register(OVERLAY_KIND, dialogKey, normalizeOptions(normalizedOptions))

  if (getCurrentScope()) {
    onScopeDispose(() => controller.destroy())
  }

  return controller
}
