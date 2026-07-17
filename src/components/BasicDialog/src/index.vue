<script setup lang="ts">
import type { DialogProps } from 'element-plus'
import { computed, type CSSProperties } from 'vue'

import { useOverlayStore, type OverlayState } from '@/stores/overlay'

import { createBasicDialogController } from './useBasicDialog'
import type { BasicDialogAction, BasicDialogController, BasicDialogOptions } from './types'

defineOptions({ name: 'BasicDialog' })

interface DialogEntry {
  dialogKey: string
  state: OverlayState
  options: BasicDialogOptions
}

const overlayStore = useOverlayStore()
const controllerCache = new Map<string, BasicDialogController>()
const originalPropKeys = [
  'appendToBody',
  'appendTo',
  'beforeClose',
  'destroyOnClose',
  'closeOnClickModal',
  'closeOnPressEscape',
  'lockScroll',
  'modal',
  'modalPenetrable',
  'openDelay',
  'closeDelay',
  'top',
  'modalClass',
  'headerClass',
  'bodyClass',
  'footerClass',
  'width',
  'zIndex',
  'trapFocus',
  'headerAriaLevel',
  'transition',
  'center',
  'alignCenter',
  'closeIcon',
  'draggable',
  'overflow',
  'fullscreen',
  'showClose',
  'title',
  'ariaLevel',
] as const satisfies readonly (keyof DialogProps)[]

const dialogs = computed<DialogEntry[]>(() =>
  Object.entries(overlayStore.records)
    .filter(([recordKey]) => recordKey.startsWith('dialog:'))
    .map(([recordKey, state]) => ({
      dialogKey: recordKey.slice('dialog:'.length),
      state,
      options: state.options as BasicDialogOptions,
    })),
)

function getController(dialogKey: string): BasicDialogController {
  let controller = controllerCache.get(dialogKey)
  if (!controller) {
    controller = createBasicDialogController(dialogKey)
    controllerCache.set(dialogKey, controller)
  }
  return controller
}

function getDialogProps(options: BasicDialogOptions): Record<string, unknown> {
  const props = Object.fromEntries(
    originalPropKeys.flatMap((key) => (key in options ? [[key, options[key]]] : [])),
  )
  const hasTitle = Boolean(options.title)

  props.showClose = hasTitle ? (options.showClose ?? true) : false
  props.headerClass = [options.headerClass, 'basic-dialog__header', !hasTitle && 'is-hidden']
    .filter(Boolean)
    .join(' ')
  props.bodyClass = [options.bodyClass, 'basic-dialog__body'].filter(Boolean).join(' ')
  props.footerClass = [options.footerClass, 'basic-dialog__footer'].filter(Boolean).join(' ')
  return props
}

function getDialogStyle(options: BasicDialogOptions): CSSProperties {
  const padding = options.bodyPadding ?? 0
  return {
    '--basic-dialog-body-padding': typeof padding === 'number' ? `${padding}px` : padding,
  } as CSSProperties
}

function setVisible(dialogKey: string, visible: boolean): void {
  overlayStore.setVisible('dialog', dialogKey, visible)
}

async function confirm(entry: DialogEntry): Promise<void> {
  const controller = getController(entry.dialogKey)
  const handler = entry.options.onConfirm as BasicDialogAction | undefined

  if (!handler) {
    if (entry.options.closeOnConfirm !== false) controller.close()
    return
  }

  controller.setLoading(true)
  try {
    await handler(entry.state.payload, controller)
    if (entry.options.closeOnConfirm !== false) controller.close()
  } finally {
    controller.setLoading(false)
  }
}

async function cancel(entry: DialogEntry): Promise<void> {
  const controller = getController(entry.dialogKey)
  const handler = entry.options.onCancel as BasicDialogAction | undefined
  if (handler) await handler(entry.state.payload, controller)
  controller.close()
}

function closed(entry: DialogEntry): void {
  entry.state.loading = false
  if (entry.options.clearPayloadOnClose !== false) entry.state.payload = undefined
  entry.options.onClosed?.()
}
</script>

<template>
  <el-dialog
    v-for="entry in dialogs"
    :key="entry.dialogKey"
    v-bind="getDialogProps(entry.options)"
    class="basic-dialog"
    :style="getDialogStyle(entry.options)"
    :model-value="entry.state.visible"
    @update:model-value="setVisible(entry.dialogKey, $event)"
    @open="entry.options.onOpen?.()"
    @opened="entry.options.onOpened?.()"
    @close="entry.options.onClose?.()"
    @closed="closed(entry)"
    @open-auto-focus="entry.options.onOpenAutoFocus?.()"
    @close-auto-focus="entry.options.onCloseAutoFocus?.()"
  >
    <div v-if="typeof entry.options.content === 'string'">
      {{ entry.options.content }}
    </div>

    <component
      :is="entry.options.content"
      v-else-if="entry.options.content"
      v-bind="entry.options.contentProps"
      :payload="entry.state.payload"
      :dialog="getController(entry.dialogKey)"
    />

    <template
      v-if="entry.options.showFooter || entry.options.cancelText || entry.options.confirmText"
      #footer
    >
      <el-button @click="cancel(entry)">{{ entry.options.cancelText }}</el-button>
      <el-button type="primary" :loading="entry.state.loading" @click="confirm(entry)">
        {{ entry.options.confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style>
:root {
  --basic-dialog-body-padding: 0;
}
.basic-dialog .el-dialog {
  padding: 0;
}

.basic-dialog__header {
  display: flex;
  min-height: 56px;
  align-items: center;
  padding: 0 20px !important;
  border-bottom: 1px solid var(--el-border-color-light);
}

.basic-dialog__header.is-hidden {
  display: none;
}

.basic-dialog__header.show-close {
  padding-right: 52px !important;
}

.basic-dialog__header .el-dialog__title {
  display: flex;
  min-width: 0;
  align-items: center;
  line-height: 1.5;
}

.basic-dialog__body {
  padding: var(--basic-dialog-body-padding, 0) !important;
}

.basic-dialog__footer {
  display: flex;
  min-height: 56px;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px !important;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
