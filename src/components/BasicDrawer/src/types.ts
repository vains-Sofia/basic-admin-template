import type { DrawerProps } from 'element-plus'
import type { Component, ComputedRef } from 'vue'

export interface BasicDrawerCloseOptions {
  clearPayload?: boolean
}

export interface BasicDrawerController<T = unknown> {
  drawerKey: string
  visible: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  payload: ComputedRef<T | undefined>
  open: (payload?: T) => void
  close: (options?: BasicDrawerCloseOptions) => void
  toggle: (payload?: T) => void
  setLoading: (loading: boolean) => void
  setPayload: (payload: T | undefined) => void
  setOptions: (options: Partial<BasicDrawerOptions<T>>) => void
  clearPayload: () => void
  destroy: () => void
}

export interface BasicDrawerContentExpose {
  validate?: () => boolean | Promise<boolean>
  getPayload?: () => unknown
}

export type BasicDrawerAction<T = unknown> = (
  payload: T | undefined,
  controller: BasicDrawerController<T>,
) => void | Promise<void>

export type BasicDrawerOptions<T = unknown> = Partial<Omit<DrawerProps, 'modelValue'>> & {
  drawerKey?: string
  content?: Component | string
  contentProps?: Record<string, unknown>
  bodyPadding?: string | number
  showFooter?: boolean
  cancelText?: string
  confirmText?: string
  closeOnConfirm?: boolean
  clearPayloadOnClose?: boolean
  onConfirm?: BasicDrawerAction<T>
  onCancel?: BasicDrawerAction<T>
  onOpen?: () => void
  onOpened?: () => void
  onClose?: () => void
  onClosed?: () => void
  onOpenAutoFocus?: () => void
  onCloseAutoFocus?: () => void
  onResizeStart?: (event: MouseEvent, size: number) => void
  onResize?: (event: MouseEvent, size: number) => void
  onResizeEnd?: (event: MouseEvent, size: number) => void
}
