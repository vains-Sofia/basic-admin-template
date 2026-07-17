import { defineStore } from 'pinia'
import { markRaw, reactive } from 'vue'

export type OverlayKind = 'drawer' | 'dialog'

export interface OverlayState {
  visible: boolean
  loading: boolean
  payload: unknown
  options: Record<string, unknown>
}

function createState(): OverlayState {
  return reactive({ visible: false, loading: false, payload: undefined, options: {} })
}

export const useOverlayStore = defineStore('overlay', () => {
  const records = reactive<Record<string, OverlayState>>({})
  const getRecordKey = (kind: OverlayKind, instanceKey: string) => `${kind}:${instanceKey}`

  function getState(kind: OverlayKind, instanceKey: string): OverlayState {
    const recordKey = getRecordKey(kind, instanceKey)
    records[recordKey] ??= createState()
    return records[recordKey]
  }

  function open(kind: OverlayKind, instanceKey: string, payload?: unknown): void {
    const state = getState(kind, instanceKey)
    state.payload = payload
    state.loading = false
    state.visible = true
  }

  function register(
    kind: OverlayKind,
    instanceKey: string,
    options: Record<string, unknown>,
  ): void {
    getState(kind, instanceKey).options = markRaw({ ...options })
  }

  function setOptions(
    kind: OverlayKind,
    instanceKey: string,
    options: Record<string, unknown>,
  ): void {
    const state = getState(kind, instanceKey)
    state.options = markRaw({ ...state.options, ...options })
  }

  function close(kind: OverlayKind, instanceKey: string, clearPayload = false): void {
    const state = getState(kind, instanceKey)
    state.visible = false
    state.loading = false
    if (clearPayload) state.payload = undefined
  }

  function setVisible(kind: OverlayKind, instanceKey: string, visible: boolean): void {
    getState(kind, instanceKey).visible = visible
  }

  function setLoading(kind: OverlayKind, instanceKey: string, loading: boolean): void {
    getState(kind, instanceKey).loading = loading
  }

  function setPayload(kind: OverlayKind, instanceKey: string, payload: unknown): void {
    getState(kind, instanceKey).payload = payload
  }

  function clearPayload(kind: OverlayKind, instanceKey: string): void {
    getState(kind, instanceKey).payload = undefined
  }

  function remove(kind: OverlayKind, instanceKey: string): void {
    delete records[getRecordKey(kind, instanceKey)]
  }

  return {
    records,
    getState,
    register,
    setOptions,
    open,
    close,
    setVisible,
    setLoading,
    setPayload,
    clearPayload,
    remove,
  }
})
