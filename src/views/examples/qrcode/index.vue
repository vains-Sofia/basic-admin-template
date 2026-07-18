<script setup lang="ts">
import { Refresh, WarningFilled } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

import QrCode, { type CornerSquareType, type DotType, type QrCodeExpose } from '@/components/QrCode'

defineOptions({ name: 'QrCodeExamples' })

type QrState = 'normal' | 'loading' | 'expired'

const content = ref('https://example.com/invite?code=ADMIN-2026')
const size = ref(220)
const dotsType = ref<DotType>('rounded')
const cornersSquareType = ref<CornerSquareType>('extra-rounded')
const dotsColor = ref('#2563eb')
const showLogo = ref(false)
const qrState = ref<QrState>('normal')
const refreshVersion = ref(1)
const customExpired = ref(true)
const customVersion = ref(1)
const downloadRef = ref<QrCodeExpose>()

const logoUrl = `${import.meta.env.BASE_URL}favicon.ico`
const stateData = computed(() => `https://example.com/session/${refreshVersion.value}`)
const customData = computed(() => `https://example.com/custom/${customVersion.value}`)
const stateOptions: Array<{ label: string; value: QrState }> = [
  { label: '正常', value: 'normal' },
  { label: '加载', value: 'loading' },
  { label: '失效', value: 'expired' },
]
const dotsTypeOptions: Array<{ label: string; value: DotType }> = [
  { label: '方形', value: 'square' },
  { label: '圆点', value: 'dots' },
  { label: '圆角', value: 'rounded' },
  { label: '优雅', value: 'classy-rounded' },
]
const cornerOptions: Array<{ label: string; value: CornerSquareType }> = [
  { label: '方形', value: 'square' },
  { label: '圆点', value: 'dot' },
  { label: '大圆角', value: 'extra-rounded' },
]

function refreshStateCode(): void {
  refreshVersion.value += 1
  qrState.value = 'normal'
}

function regenerateCustomCode(): void {
  customVersion.value += 1
  customExpired.value = false
}
</script>

<template>
  <div class="qr-example-page">
    <header class="qr-example-page__header">
      <h1 class="page-title">二维码示例</h1>
    </header>

    <section class="page-section playground">
      <div class="example-heading">
        <h2>实时配置</h2>
        <el-tag effect="plain">QrCode</el-tag>
      </div>

      <div class="playground__content">
        <div class="controls">
          <label class="control control--wide">
            <span>二维码内容</span>
            <el-input v-model="content" clearable />
          </label>

          <label class="control">
            <span>尺寸 {{ size }} px</span>
            <el-slider v-model="size" :min="160" :max="240" :step="8" />
          </label>

          <label class="control">
            <span>前景色</span>
            <el-color-picker v-model="dotsColor" />
          </label>

          <label class="control">
            <span>点阵样式</span>
            <el-select v-model="dotsType">
              <el-option
                v-for="option in dotsTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </label>

          <label class="control">
            <span>定位角样式</span>
            <el-select v-model="cornersSquareType">
              <el-option
                v-for="option in cornerOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </label>

          <label class="control control--switch">
            <span>中心 Logo</span>
            <el-switch v-model="showLogo" />
          </label>
        </div>

        <div class="qr-stage">
          <QrCode
            :data="content || ' '"
            :size="size"
            :image="showLogo ? logoUrl : ''"
            :dots-type="dotsType"
            :corners-square-type="cornersSquareType"
            :dots-color="dotsColor"
            transition
          />
        </div>
      </div>
    </section>

    <div class="case-grid">
      <section class="page-section example-case">
        <div class="example-heading">
          <h2>品牌样式</h2>
          <el-tag type="success" effect="plain">Logo</el-tag>
        </div>
        <div class="case-stage">
          <QrCode
            data="https://example.com/product/basic-admin"
            :size="192"
            :image="logoUrl"
            :image-size="0.24"
            dots-type="classy-rounded"
            corners-square-type="extra-rounded"
            corners-dot-type="dot"
            dots-color="#047857"
          />
        </div>
      </section>

      <section class="page-section example-case">
        <div class="example-heading example-heading--stacked">
          <h2>状态蒙层</h2>
          <el-segmented v-model="qrState" :options="stateOptions" size="small" />
        </div>
        <div class="case-stage">
          <QrCode
            :data="stateData"
            :size="192"
            dots-type="rounded"
            :loading="qrState === 'loading'"
            :expired="qrState === 'expired'"
            :on-refresh="refreshStateCode"
            transition
          />
        </div>
      </section>

      <section class="page-section example-case">
        <div class="example-heading">
          <h2>自定义插槽</h2>
          <el-switch
            v-model="customExpired"
            inline-prompt
            active-text="失效"
            inactive-text="正常"
          />
        </div>
        <div class="case-stage">
          <QrCode :data="customData" :size="192" :expired="customExpired">
            <template #expired>
              <div class="custom-expired">
                <el-icon :size="24"><WarningFilled /></el-icon>
                <strong>链接已过期</strong>
                <el-button
                  type="warning"
                  size="small"
                  :icon="Refresh"
                  @click="regenerateCustomCode"
                >
                  再次生成
                </el-button>
              </div>
            </template>
          </QrCode>
        </div>
      </section>

      <section class="page-section example-case">
        <div class="example-heading">
          <h2>文件下载</h2>
          <el-button link type="primary" @click="downloadRef?.download('admin-code', 'png')">
            下载 PNG
          </el-button>
        </div>
        <div class="case-stage">
          <QrCode
            ref="downloadRef"
            data="https://example.com/download"
            :size="192"
            dots-type="dots"
            corners-square-type="extra-rounded"
            dots-color="#b45309"
            show-download
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.qr-example-page {
  min-width: 0;
}

.qr-example-page__header {
  margin-bottom: 18px;
}

.playground {
  margin-bottom: 14px;
}

.example-heading {
  display: flex;
  min-height: 28px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.example-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.playground__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  align-items: stretch;
  gap: 24px;
}

.controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
  gap: 18px 20px;
}

.control {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.control > span {
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.control--wide {
  grid-column: 1 / -1;
}

.control--switch {
  align-items: flex-start;
}

.qr-stage,
.case-stage {
  display: grid;
  min-width: 0;
  place-items: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-extra-light);
}

.qr-stage {
  min-height: 280px;
  padding: 18px;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.example-case {
  min-width: 0;
}

.example-heading--stacked {
  align-items: flex-start;
  flex-direction: column;
}

.case-stage {
  min-height: 260px;
  padding: 20px;
}

.custom-expired {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;
  color: var(--el-color-warning-dark-2);
  font-size: 13px;
}

.custom-expired strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

@media (max-width: 900px) {
  .playground__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .case-grid,
  .controls {
    grid-template-columns: 1fr;
  }

  .control--wide {
    grid-column: auto;
  }
}

@media (max-width: 380px) {
  .qr-stage,
  .case-stage {
    margin-inline: -8px;
    padding-inline: 8px;
  }
}
</style>
