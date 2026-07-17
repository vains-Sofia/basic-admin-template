<script setup lang="ts">
import type { DrawerProps } from 'element-plus'
import { computed, type CSSProperties } from 'vue'

import { useOverlayStore, type OverlayState } from '@/stores/overlay'

import { createBasicDrawerController } from './useBasicDrawer'
import type { BasicDrawerAction, BasicDrawerController, BasicDrawerOptions } from './types'

defineOptions({ name: 'BasicDrawer' })

interface DrawerEntry {
  drawerKey: string
  state: OverlayState
  options: BasicDrawerOptions
}

const overlayStore = useOverlayStore()
const controllerCache = new Map<string, BasicDrawerController>()
const originalPropKeys = [
  'direction',
  'resizable',
  'size',
  'withHeader',
  'modalFade',
  'headerAriaLevel',
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
] as const satisfies readonly (keyof DrawerProps)[]

const drawers = computed<DrawerEntry[]>(() =>
  Object.entries(overlayStore.records)
    .filter(([recordKey]) => recordKey.startsWith('drawer:'))
    .map(([recordKey, state]) => ({
      drawerKey: recordKey.slice('drawer:'.length),
      state,
      options: state.options as BasicDrawerOptions,
    })),
)

function getController(drawerKey: string): BasicDrawerController {
  let controller = controllerCache.get(drawerKey)
  if (!controller) {
    controller = createBasicDrawerController(drawerKey)
    controllerCache.set(drawerKey, controller)
  }
  return controller
}

function getDrawerProps(options: BasicDrawerOptions): Record<string, unknown> {
  const props = Object.fromEntries(
    originalPropKeys.flatMap((key) => (key in options ? [[key, options[key]]] : [])),
  )

  props.withHeader = Boolean(options.title) && options.withHeader !== false
  props.showClose = options.showClose ?? true
  props.headerClass = [options.headerClass, 'basic-drawer__header'].filter(Boolean).join(' ')
  props.bodyClass = [options.bodyClass, 'basic-drawer__body'].filter(Boolean).join(' ')
  props.footerClass = [options.footerClass, 'basic-drawer__footer'].filter(Boolean).join(' ')
  return props
}

function getDrawerStyle(options: BasicDrawerOptions): CSSProperties {
  const padding = options.bodyPadding ?? 0
  return {
    '--basic-drawer-body-padding': typeof padding === 'number' ? `${padding}px` : padding,
  } as CSSProperties
}

function setVisible(drawerKey: string, visible: boolean): void {
  overlayStore.setVisible('drawer', drawerKey, visible)
}

function getResizeListeners(entry: DrawerEntry) {
  return {
    'resize-start': (event: MouseEvent, size: number) => entry.options.onResizeStart?.(event, size),
    resize: (event: MouseEvent, size: number) => entry.options.onResize?.(event, size),
    'resize-end': (event: MouseEvent, size: number) => entry.options.onResizeEnd?.(event, size),
  }
}

async function confirm(entry: DrawerEntry): Promise<void> {
  const controller = getController(entry.drawerKey)
  const handler = entry.options.onConfirm as BasicDrawerAction | undefined

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

async function cancel(entry: DrawerEntry): Promise<void> {
  const controller = getController(entry.drawerKey)
  const handler = entry.options.onCancel as BasicDrawerAction | undefined
  if (handler) await handler(entry.state.payload, controller)
  controller.close()
}

function closed(entry: DrawerEntry): void {
  entry.state.loading = false
  if (entry.options.clearPayloadOnClose !== false) entry.state.payload = undefined
  entry.options.onClosed?.()
}
</script>

<template>
  <el-drawer
    v-for="entry in drawers"
    :key="entry.drawerKey"
    v-bind="getDrawerProps(entry.options)"
    v-on="getResizeListeners(entry)"
    class="basic-drawer"
    :style="getDrawerStyle(entry.options)"
    :model-value="entry.state.visible"
    @update:model-value="setVisible(entry.drawerKey, $event)"
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
      :drawer="getController(entry.drawerKey)"
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
  </el-drawer>
</template>

<style>
:root {
  --basic-drawer-body-padding: 0;
}

.basic-drawer__header {
  min-height: 56px;
  margin-bottom: 0 !important;
  padding: 0 20px !important;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
}

.basic-drawer__header .el-drawer__title {
  display: flex;
  min-width: 0;
  align-items: center;
  margin: 0;
  line-height: 1.5;
}

.basic-drawer__header .el-drawer__close-btn {
  align-items: center;
  justify-content: center;
}

.basic-drawer__body {
  padding: var(--basic-drawer-body-padding, 0) !important;
}

.basic-drawer__footer {
  display: flex;
  min-height: 56px;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px !important;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
