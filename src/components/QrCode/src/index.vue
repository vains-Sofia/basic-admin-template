<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { computed, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'
import QRCodeStyling, { type FileExtension, type Options } from 'qr-code-styling'

import type { QrCodeProps } from './types'

import './qr-code.css'

defineOptions({ name: 'QrCode' })

const props = withDefaults(defineProps<QrCodeProps>(), {
  size: 300,
  image: '',
  imageSize: 0.2,
  dotsType: 'square',
  background: '#ffffff',
  dotsColor: '#000000',
  showDownload: false,
  expired: false,
  loading: false,
  loadingText: '加载中...',
  transition: false,
})

defineSlots<{
  loading(): unknown
  expired(): unknown
}>()

const containerRef = ref<HTMLElement>()
const isReady = ref(false)
const downloadExtension = ref<FileExtension>('svg')
let qrCode: QRCodeStyling | undefined
let transitionFrame: number | undefined

const normalizedSize = computed(() => Math.max(1, props.size))
const containerStyle = computed<CSSProperties>(() => ({
  width: `${normalizedSize.value}px`,
  height: `${normalizedSize.value}px`,
}))

function createOptions(): Options {
  return {
    width: normalizedSize.value,
    height: normalizedSize.value,
    data: props.data,
    image: props.image || undefined,
    imageOptions: { imageSize: props.imageSize },
    dotsOptions: { color: props.dotsColor, type: props.dotsType },
    cornersSquareOptions: { type: props.cornersSquareType },
    cornersDotOptions: { type: props.cornersDotType },
    backgroundOptions: { color: props.background },
    qrOptions: { typeNumber: 0, errorCorrectionLevel: 'Q' },
  }
}

function markReady(): void {
  if (transitionFrame !== undefined) cancelAnimationFrame(transitionFrame)

  if (!props.transition) {
    isReady.value = true
    transitionFrame = undefined
    return
  }

  transitionFrame = requestAnimationFrame(() => {
    isReady.value = true
    transitionFrame = undefined
  })
}

onMounted(() => {
  qrCode = new QRCodeStyling(createOptions())
  qrCode.append(containerRef.value)
  markReady()
})

watch(createOptions, (options) => {
  if (!qrCode) return

  isReady.value = false
  qrCode.update(options)
  markReady()
})

onBeforeUnmount(() => {
  if (transitionFrame !== undefined) cancelAnimationFrame(transitionFrame)
  qrCode = undefined
})

function handleCommand(command: FileExtension): void {
  downloadExtension.value = command
}

function download(
  fileName = 'qrcode',
  extension: FileExtension = downloadExtension.value,
): Promise<void> {
  return qrCode?.download({ name: fileName, extension }) ?? Promise.resolve()
}

defineExpose({ download })
</script>

<template>
  <div class="qr-code" :style="{ width: `${normalizedSize}px` }">
    <div
      class="qr-code__container"
      :class="{ 'qr-code__container--transition': transition, 'is-ready': isReady }"
      :style="containerStyle"
    >
      <div ref="containerRef" class="qr-code__drawing" />

      <div
        v-if="loading"
        class="qr-code__mask qr-code__loading-mask"
        role="status"
        aria-live="polite"
      >
        <slot name="loading">
          <div class="qr-code__loading-content">
            <el-icon class="qr-code__loading-icon" :size="22"><Loading /></el-icon>
            <span class="qr-code__loading-text">{{ loadingText }}</span>
          </div>
        </slot>
      </div>

      <div v-else-if="expired" class="qr-code__mask">
        <slot name="expired">
          <div class="qr-code__expired-content">
            <span class="qr-code__expired-text">二维码已失效</span>
            <el-button v-if="onRefresh" type="primary" size="small" link @click="onRefresh">
              重新获取
            </el-button>
          </div>
        </slot>
      </div>
    </div>

    <el-dropdown v-if="showDownload" split-button @click="download()" @command="handleCommand">
      下载 {{ downloadExtension }}
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="svg">svg</el-dropdown-item>
          <el-dropdown-item command="png">png</el-dropdown-item>
          <el-dropdown-item command="jpeg">jpeg</el-dropdown-item>
          <el-dropdown-item command="webp">webp</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
