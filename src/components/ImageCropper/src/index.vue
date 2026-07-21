<script setup lang="ts">
import {
  Loading,
  RefreshLeft,
  RefreshRight,
  Sort,
  Switch,
  Upload,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue'
import Cropper, { type CropperImage, type CropperSelection } from 'cropperjs'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ImageCropperProps } from './types'

import './image-cropper.css'

defineOptions({ name: 'ImageCropper' })

const props = withDefaults(defineProps<ImageCropperProps>(), {
  modelValue: '',
  width: 300,
  height: 300,
  quality: 1,
  aspectRatio: undefined,
  mimeType: 'image/png',
  preserveResolution: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: File]
  'update:blob': [value: Blob]
  'update:url': [value: string]
  error: [error: Error]
}>()

interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

interface TransformEventDetail {
  matrix?: number[]
}

const containerRef = ref<HTMLDivElement>()
const imageRef = ref<HTMLImageElement>()
const fileInputRef = ref<HTMLInputElement>()
const sourceUrl = ref('')
const previewUrl = ref('')
const loading = ref(false)
const errorMessage = ref('')
const generatedWidth = ref(0)
const generatedHeight = ref(0)

const outputWidth = computed(() =>
  Number.isFinite(props.width) ? Math.max(1, Math.round(props.width)) : 300,
)
const outputHeight = computed(() =>
  Number.isFinite(props.height) ? Math.max(1, Math.round(props.height)) : 300,
)
const outputQuality = computed(() =>
  Number.isFinite(props.quality) ? Math.min(1, Math.max(0, props.quality)) : 1,
)
const selectionAspectRatio = computed(() => {
  const aspectRatio = props.aspectRatio
  if (aspectRatio !== undefined && Number.isFinite(aspectRatio) && aspectRatio > 0) {
    return aspectRatio
  }
  return outputWidth.value / outputHeight.value
})
const rootStyle = computed(() => ({
  '--image-cropper-stage-height': `${Math.min(560, Math.max(320, outputHeight.value + 100))}px`,
  '--image-cropper-preview-ratio': `${outputWidth.value} / ${outputHeight.value}`,
}))
const previewSizeLabel = computed(() => {
  const width = generatedWidth.value || outputWidth.value
  const height = generatedHeight.value || outputHeight.value
  return `${width} × ${height}`
})

let cropper: Cropper | undefined
let mounted = false
let sourceObjectUrl = ''
let outputObjectUrl = ''
let previewObjectUrl = ''
let previewTimer: number | undefined
let outputTimer: number | undefined
let initializationId = 0
let renderRequestId = 0

function revokeObjectUrl(url: string): void {
  if (url) URL.revokeObjectURL(url)
}

function clearPreview(): void {
  renderRequestId += 1
  if (previewTimer !== undefined) {
    window.clearTimeout(previewTimer)
    previewTimer = undefined
  }
  revokeObjectUrl(outputObjectUrl)
  revokeObjectUrl(previewObjectUrl)
  outputObjectUrl = ''
  previewObjectUrl = ''
  previewUrl.value = ''
  generatedWidth.value = 0
  generatedHeight.value = 0
}

function destroyCropper(): void {
  if (outputTimer !== undefined) {
    window.clearTimeout(outputTimer)
    outputTimer = undefined
  }
  cropper?.destroy()
  cropper = undefined
}

function reportError(value: unknown): void {
  const error = value instanceof Error ? value : new Error('图片处理失败')
  errorMessage.value = error.message || '图片处理失败'
  loading.value = false
  emit('error', error)
}

function canvasToBlob(canvas: HTMLCanvasElement, quality = outputQuality.value): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('无法生成裁剪图片'))
      },
      props.mimeType,
      quality,
    )
  })
}

function setPreviewBlob(blob: Blob, width: number, height: number): void {
  revokeObjectUrl(previewObjectUrl)
  previewObjectUrl = URL.createObjectURL(blob)
  previewUrl.value = previewObjectUrl
  generatedWidth.value = width
  generatedHeight.value = height
}

function setOutputBlob(blob: Blob, width: number, height: number): void {
  revokeObjectUrl(previewObjectUrl)
  previewObjectUrl = ''
  revokeObjectUrl(outputObjectUrl)
  outputObjectUrl = URL.createObjectURL(blob)
  previewUrl.value = outputObjectUrl
  generatedWidth.value = width
  generatedHeight.value = height
}

function getOutputSize(
  selection: CropperSelection,
  image: CropperImage,
): {
  width: number
  height: number
} {
  if (!props.preserveResolution) {
    return { width: outputWidth.value, height: outputHeight.value }
  }

  const matrix = image.$getTransform()
  const a = matrix[0] ?? Number.NaN
  const b = matrix[1] ?? Number.NaN
  const c = matrix[2] ?? Number.NaN
  const d = matrix[3] ?? Number.NaN
  if ([a, b, c, d].some((value) => !Number.isFinite(value))) {
    return { width: outputWidth.value, height: outputHeight.value }
  }

  const scaleX = Math.hypot(a, b)
  const scaleY = Math.hypot(c, d)
  if (scaleX <= 0 || scaleY <= 0) {
    return { width: outputWidth.value, height: outputHeight.value }
  }

  return {
    width: Math.max(1, Math.round(selection.width / scaleX)),
    height: Math.max(1, Math.round(selection.height / scaleY)),
  }
}

async function generatePreview(requestId: number): Promise<void> {
  const activeCropper = cropper
  const selection = activeCropper?.getCropperSelection()
  if (!activeCropper || !selection || loading.value) return

  const previewSize = getPreviewSize()
  try {
    const canvas = await selection.$toCanvas(previewSize)
    const previewQuality = props.mimeType === 'image/png' ? 1 : Math.min(0.6, outputQuality.value)
    const blob = await canvasToBlob(canvas, previewQuality)
    if (requestId !== renderRequestId || activeCropper !== cropper) return
    setPreviewBlob(blob, previewSize.width, previewSize.height)
  } catch (error) {
    if (requestId === renderRequestId) reportError(error)
  }
}

function getPreviewSize(): { width: number; height: number } {
  const maxSize = 640
  const scale = Math.min(1, maxSize / outputWidth.value, maxSize / outputHeight.value)
  return {
    width: Math.max(1, Math.round(outputWidth.value * scale)),
    height: Math.max(1, Math.round(outputHeight.value * scale)),
  }
}

async function generateOutput(requestId: number): Promise<void> {
  const activeCropper = cropper
  const selection = activeCropper?.getCropperSelection()
  const image = activeCropper?.getCropperImage()
  if (!activeCropper || !selection || !image || loading.value) return

  try {
    const outputSize = getOutputSize(selection, image)
    const canvas = await selection.$toCanvas(outputSize)
    const blob = await canvasToBlob(canvas)
    if (requestId !== renderRequestId || activeCropper !== cropper) return

    setOutputBlob(blob, outputSize.width, outputSize.height)
    emit('update:blob', blob)
    emit('update:url', outputObjectUrl)
  } catch (error) {
    if (requestId === renderRequestId) reportError(error)
  }
}

function scheduleOutput(delay = 120): void {
  const requestId = ++renderRequestId
  if (previewTimer !== undefined) window.clearTimeout(previewTimer)
  previewTimer = window.setTimeout(() => {
    previewTimer = undefined
    void generatePreview(requestId)
  }, 0)
  if (outputTimer !== undefined) window.clearTimeout(outputTimer)
  outputTimer = window.setTimeout(() => {
    outputTimer = undefined
    void generateOutput(requestId)
  }, delay)
}

function fitSelection(): void {
  const activeCropper = cropper
  const canvas = activeCropper?.getCropperCanvas()
  const selection = activeCropper?.getCropperSelection()
  if (!canvas || !selection) return

  const canvasRect = canvas.getBoundingClientRect()
  const availableWidth = canvasRect.width > 0 ? canvasRect.width * 0.72 : outputWidth.value
  const availableHeight = canvasRect.height > 0 ? canvasRect.height * 0.72 : outputHeight.value
  const scale = Math.min(
    1,
    availableWidth / outputWidth.value,
    availableHeight / outputHeight.value,
  )

  selection.movable = true
  selection.resizable = true
  selection.zoomable = true
  selection.outlined = true
  selection.aspectRatio = selectionAspectRatio.value
  selection.initialAspectRatio = selectionAspectRatio.value
  selection
    .$change(
      0,
      0,
      outputWidth.value * scale,
      outputHeight.value * scale,
      selectionAspectRatio.value,
    )
    .$center()
}

async function initializeCropper(): Promise<void> {
  const requestId = ++initializationId
  destroyCropper()

  if (!sourceUrl.value) {
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''
  await nextTick()

  if (requestId !== initializationId || !mounted || !imageRef.value || !containerRef.value) {
    return
  }

  const instance = new Cropper(imageRef.value, { container: containerRef.value })
  cropper = instance

  try {
    instance.getCropperCanvas()?.$addStyles(':host { width: 100%; height: 100%; }')

    const cropperImage = instance.getCropperImage()
    if (!cropperImage) throw new Error('裁剪器初始化失败')
    await cropperImage.$ready()

    if (requestId !== initializationId || instance !== cropper) return

    cropperImage.$center('cover')
    fitSelection()

    const handles = containerRef.value.querySelectorAll('cropper-handle[action="select"]')
    handles.forEach((handle) => handle.setAttribute('action', 'move'))

    loading.value = false
    scheduleOutput(0)
  } catch (error) {
    if (requestId === initializationId) reportError(error)
  }
}

function updateSource(value: string | File): void {
  destroyCropper()
  clearPreview()
  revokeObjectUrl(sourceObjectUrl)
  sourceObjectUrl = ''
  sourceUrl.value = ''
  errorMessage.value = ''

  if (value instanceof File) {
    sourceObjectUrl = URL.createObjectURL(value)
    sourceUrl.value = sourceObjectUrl
  } else {
    sourceUrl.value = value
  }

  if (mounted) void initializeCropper()
}

function isInside(selection: SelectionRect, boundary: SelectionRect): boolean {
  const tolerance = 0.5
  return (
    selection.x + tolerance >= boundary.x &&
    selection.y + tolerance >= boundary.y &&
    selection.x + selection.width <= boundary.x + boundary.width + tolerance &&
    selection.y + selection.height <= boundary.y + boundary.height + tolerance
  )
}

function getImageBoundary(image: CropperImage): SelectionRect | undefined {
  const canvas = cropper?.getCropperCanvas()
  if (!canvas) return undefined

  const canvasRect = canvas.getBoundingClientRect()
  const imageRect = image.getBoundingClientRect()
  return {
    x: imageRect.left - canvasRect.left,
    y: imageRect.top - canvasRect.top,
    width: imageRect.width,
    height: imageRect.height,
  }
}

function handleTransform(event: Event): void {
  const customEvent = event as CustomEvent<TransformEventDetail>
  const image = cropper?.getCropperImage()
  const selection = cropper?.getCropperSelection()
  const canvas = cropper?.getCropperCanvas()
  const matrix = customEvent.detail?.matrix
  if (!image || !selection || !canvas || !matrix) return

  const clone = image.cloneNode() as CropperImage
  clone.style.transform = `matrix(${matrix.join(', ')})`
  clone.style.opacity = '0'
  canvas.appendChild(clone)
  const boundary = getImageBoundary(clone)
  canvas.removeChild(clone)

  if (
    boundary &&
    !isInside(
      { x: selection.x, y: selection.y, width: selection.width, height: selection.height },
      boundary,
    )
  ) {
    event.preventDefault()
  }
}

function handleSelectionChange(event: Event): void {
  const image = cropper?.getCropperImage()
  const selection = (event as CustomEvent<SelectionRect>).detail
  if (!image || !selection) return

  const boundary = getImageBoundary(image)
  if (boundary && !isInside(selection, boundary)) event.preventDefault()
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) {
    emit('update:modelValue', file)
  }
}

function openFile(): void {
  fileInputRef.value?.click()
}

function transformImage(action: (image: CropperImage) => void): void {
  const image = cropper?.getCropperImage()
  if (!image) return
  action(image)
  scheduleOutput()
}

watch(
  () => props.modelValue,
  (value) => updateSource(value),
  { immediate: true },
)

watch(
  () => [props.width, props.height, props.aspectRatio] as const,
  () => {
    if (mounted && sourceUrl.value) void initializeCropper()
  },
)

watch(
  () => [props.quality, props.mimeType, props.preserveResolution] as const,
  () => scheduleOutput(0),
)

onMounted(() => {
  mounted = true
  if (sourceUrl.value) void initializeCropper()
})

onBeforeUnmount(() => {
  mounted = false
  initializationId += 1
  destroyCropper()
  clearPreview()
  revokeObjectUrl(sourceObjectUrl)
  sourceObjectUrl = ''
})
</script>

<template>
  <div class="image-cropper" :style="rootStyle">
    <div
      ref="containerRef"
      class="image-cropper__stage"
      @action="scheduleOutput()"
      @transform="handleTransform"
      @change="handleSelectionChange"
    >
      <img
        v-if="sourceUrl"
        ref="imageRef"
        class="image-cropper__source"
        :src="sourceUrl"
        alt="待裁剪图片"
      />

      <div v-if="!sourceUrl" class="image-cropper__empty">
        <el-icon :size="30"><Upload /></el-icon>
        <el-button type="primary" @click="openFile">选择图片</el-button>
      </div>

      <div v-else-if="loading" class="image-cropper__status" role="status">
        <el-icon class="image-cropper__loading-icon" :size="24"><Loading /></el-icon>
        <span>正在载入图片</span>
      </div>

      <div v-else-if="errorMessage" class="image-cropper__status image-cropper__status--error">
        <span>{{ errorMessage }}</span>
        <el-button size="small" @click="openFile">重新选择</el-button>
      </div>

      <div v-if="sourceUrl && !loading && !errorMessage" class="image-cropper__toolbar">
        <el-tooltip content="更换图片" placement="bottom">
          <button type="button" aria-label="更换图片" @click="openFile">
            <el-icon><Upload /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="放大" placement="bottom">
          <button
            type="button"
            aria-label="放大"
            @click="transformImage((image) => image.$zoom(0.1))"
          >
            <el-icon><ZoomIn /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="缩小" placement="bottom">
          <button
            type="button"
            aria-label="缩小"
            @click="transformImage((image) => image.$zoom(-0.1))"
          >
            <el-icon><ZoomOut /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="向左旋转" placement="bottom">
          <button
            type="button"
            aria-label="向左旋转"
            @click="transformImage((image) => image.$rotate('-90deg'))"
          >
            <el-icon><RefreshLeft /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="向右旋转" placement="bottom">
          <button
            type="button"
            aria-label="向右旋转"
            @click="transformImage((image) => image.$rotate('90deg'))"
          >
            <el-icon><RefreshRight /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="水平翻转" placement="bottom">
          <button
            type="button"
            aria-label="水平翻转"
            @click="transformImage((image) => image.$scale(-1, 1))"
          >
            <el-icon><Switch /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="垂直翻转" placement="bottom">
          <button
            type="button"
            aria-label="垂直翻转"
            @click="transformImage((image) => image.$scale(1, -1))"
          >
            <el-icon><Sort /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>

    <aside class="image-cropper__preview-panel">
      <div class="image-cropper__preview-heading">
        <span>裁剪预览</span>
        <span>{{ previewSizeLabel }}</span>
      </div>
      <div class="image-cropper__preview">
        <img v-if="previewUrl" :src="previewUrl" alt="裁剪预览" />
        <span v-else>暂无预览</span>
      </div>
    </aside>

    <input
      ref="fileInputRef"
      class="image-cropper__file-input"
      type="file"
      accept="image/*"
      @change="handleFileChange"
    />
  </div>
</template>
