import type { DialogProps } from 'element-plus'
import type { Component, ComputedRef } from 'vue'

export interface BasicDialogCloseOptions {
  clearPayload?: boolean
}

export interface BasicDialogController<T = unknown> {
  dialogKey: string
  visible: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  payload: ComputedRef<T | undefined>
  open: (payload?: T) => void
  close: (options?: BasicDialogCloseOptions) => void
  toggle: (payload?: T) => void
  setLoading: (loading: boolean) => void
  setPayload: (payload: T | undefined) => void
  setOptions: (options: Partial<BasicDialogOptions<T>>) => void
  clearPayload: () => void
  destroy: () => void
}

export type BasicDialogAction<T = unknown> = (
  payload: T | undefined,
  controller: BasicDialogController<T>,
) => void | Promise<void>

export type BasicDialogOptions<T = unknown> = Partial<Omit<DialogProps, 'modelValue'>> & {
  dialogKey?: string
  content?: Component | string
  contentProps?: Record<string, unknown>
  bodyPadding?: string | number
  showFooter?: boolean
  cancelText?: string
  confirmText?: string
  closeOnConfirm?: boolean
  clearPayloadOnClose?: boolean
  onConfirm?: BasicDialogAction<T>
  onCancel?: BasicDialogAction<T>
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  onOpenAutoFocus?: () => void
  onCloseAutoFocus?: () => void
}
