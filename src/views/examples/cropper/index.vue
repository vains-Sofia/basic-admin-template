<script setup lang="ts">
import { Download, Picture, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, ref } from 'vue'

import ImageCropper, {
  type ImageCropperMimeType,
  type ImageCropperModelValue,
} from '@/components/ImageCropper'

defineOptions({ name: 'ImageCropperExamples' })

type RatioMode = 'custom' | 'square' | 'landscape'

const demoImageUrl = `${import.meta.env.BASE_URL}cropper-demo.svg`
const source = ref<ImageCropperModelValue>(demoImageUrl)
const resultBlob = ref<Blob>()
const resultUrl = ref('')
const width = ref(480)
const height = ref(320)
const quality = ref(1)
const preserveResolution = ref(true)
const ratioMode = ref<RatioMode>('landscape')
const mimeType = ref<ImageCropperMimeType>('image/png')

const ratioOptions = [
  { label: '按框', value: 'custom' },
  { label: '1 : 1', value: 'square' },
  { label: '3 : 2', value: 'landscape' },
]
const formatOptions: Array<{ label: string; value: ImageCropperMimeType }> = [
  { label: 'PNG', value: 'image/png' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'WebP', value: 'image/webp' },
]
const aspectRatio = computed<number | undefined>(() => {
  if (ratioMode.value === 'square') return 1
  if (ratioMode.value === 'landscape') return 3 / 2
  return undefined
})
const sourceLabel = computed(() =>
  typeof source.value === 'string' ? '演示图片' : source.value.name,
)
const dimensionLabel = computed(() => (preserveResolution.value ? '裁剪框' : '输出'))
const resultSize = computed(() => {
  if (!resultBlob.value) return ''
  return `${Math.round(resultBlob.value.size / 1024)} KB`
})

function updateBlob(blob: Blob): void {
  resultBlob.value = blob
}

function updateUrl(url: string): void {
  resultUrl.value = url
}

function resetDemo(): void {
  source.value = demoImageUrl
  resultBlob.value = undefined
  resultUrl.value = ''
}

function handleError(error: Error): void {
  ElMessage.error(error.message)
}

function downloadResult(): void {
  if (!resultBlob.value) return

  const extension = mimeType.value.split('/')[1] ?? 'png'
  const downloadUrl = URL.createObjectURL(resultBlob.value)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `cropped-image.${extension}`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
}

onBeforeUnmount(() => {
  resultBlob.value = undefined
})
</script>

<template>
  <div class="cropper-example-page">
    <header class="cropper-example-page__header">
      <div>
        <h1 class="page-title">图片裁剪示例</h1>
        <p>ImageCropper</p>
      </div>
      <el-button :icon="RefreshLeft" @click="resetDemo">恢复示例图片</el-button>
    </header>

    <section class="page-section cropper-example-page__section">
      <div class="example-heading">
        <h2>裁剪设置</h2>
        <el-tag effect="plain">Cropper.js 2</el-tag>
      </div>

      <div class="cropper-controls">
        <label class="cropper-control">
          <span>输出比例</span>
          <el-segmented v-model="ratioMode" :options="ratioOptions" />
        </label>

        <label class="cropper-control">
          <span>{{ dimensionLabel }}宽度</span>
          <el-input-number
            v-model="width"
            :min="64"
            :max="1600"
            :step="16"
            controls-position="right"
          />
        </label>

        <label class="cropper-control">
          <span>{{ dimensionLabel }}高度</span>
          <el-input-number
            v-model="height"
            :min="64"
            :max="1600"
            :step="16"
            controls-position="right"
          />
        </label>

        <label class="cropper-control">
          <span>输出格式</span>
          <el-select v-model="mimeType">
            <el-option
              v-for="option in formatOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </label>

        <label class="cropper-control cropper-control--switch">
          <span>原图分辨率</span>
          <el-switch
            v-model="preserveResolution"
            inline-prompt
            active-text="保留"
            inactive-text="缩放"
          />
        </label>

        <label class="cropper-control cropper-control--quality">
          <span>图片质量 {{ Math.round(quality * 100) }}%</span>
          <el-slider
            v-model="quality"
            :min="0.1"
            :max="1"
            :step="0.05"
            :disabled="mimeType === 'image/png'"
          />
        </label>
      </div>
    </section>

    <section class="page-section cropper-example-page__section">
      <div class="example-heading">
        <h2>编辑图片</h2>
        <el-tag type="info" effect="plain">
          <el-icon><Picture /></el-icon>
          {{ sourceLabel }}
        </el-tag>
      </div>

      <ImageCropper
        v-model="source"
        :width="width"
        :height="height"
        :aspect-ratio="aspectRatio"
        :quality="quality"
        :mime-type="mimeType"
        :preserve-resolution="preserveResolution"
        @update:blob="updateBlob"
        @update:url="updateUrl"
        @error="handleError"
      />
    </section>

    <section class="page-section cropper-result">
      <div class="example-heading">
        <div>
          <h2>裁剪结果</h2>
          <span v-if="resultBlob" class="cropper-result__meta">
            {{ resultBlob.type }} · {{ resultSize }}
          </span>
        </div>
        <el-button type="primary" :icon="Download" :disabled="!resultBlob" @click="downloadResult">
          下载图片
        </el-button>
      </div>

      <div v-if="resultUrl" class="cropper-result__preview">
        <img :src="resultUrl" alt="裁剪结果" />
      </div>
      <el-empty v-else description="完成裁剪后，结果会显示在这里" />
    </section>
  </div>
</template>

<style scoped>
.cropper-example-page {
  min-width: 0;
}

.cropper-example-page__header,
.example-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.cropper-example-page__header {
  margin-bottom: 18px;
}

.cropper-example-page__header p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.cropper-example-page__section {
  margin-bottom: 14px;
}

.example-heading {
  min-height: 28px;
  margin-bottom: 18px;
}

.example-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.cropper-controls {
  display: grid;
  grid-template-columns: minmax(170px, 1.5fr) repeat(4, minmax(120px, 1fr)) minmax(180px, 1.4fr);
  align-items: end;
  gap: 16px;
}

.cropper-control {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.cropper-control > span {
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.cropper-control--quality {
  padding-bottom: 4px;
}

.cropper-control--switch {
  align-items: flex-start;
}

.cropper-result__meta {
  display: block;
  margin-top: 5px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 400;
}

.cropper-result__preview {
  display: grid;
  min-height: 220px;
  padding: 18px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-extra-light);
  place-items: center;
}

.cropper-result__preview img {
  display: block;
  max-width: 100%;
  max-height: 420px;
  object-fit: contain;
}

@media (max-width: 1100px) {
  .cropper-controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cropper-control:first-child {
    grid-column: span 3;
  }

  .cropper-control--quality {
    grid-column: span 2;
  }
}

@media (max-width: 720px) {
  .cropper-example-page__header,
  .example-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .cropper-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cropper-control:first-child,
  .cropper-control--quality {
    grid-column: span 2;
  }
}

@media (max-width: 420px) {
  .cropper-controls {
    grid-template-columns: 1fr;
  }

  .cropper-control:first-child,
  .cropper-control--quality {
    grid-column: auto;
  }
}
</style>
