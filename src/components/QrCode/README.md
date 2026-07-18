# QrCode

`QrCode` 基于 `qr-code-styling` 封装，支持 Logo、点阵和定位角样式、加载/失效蒙层、淡入动画以及 SVG、PNG、JPEG、WebP 下载。

## 基础用法

```vue
<script setup lang="ts">
import QrCode from '@/components/QrCode'

const expired = ref(false)

function refresh(): void {
  expired.value = false
}
</script>

<template>
  <QrCode
    data="https://example.com"
    :size="240"
    dots-type="rounded"
    corners-square-type="extra-rounded"
    dots-color="#2563eb"
    :expired="expired"
    :on-refresh="refresh"
    show-download
    transition
  />
</template>
```

`loading` 的优先级高于 `expired`。可通过 `#loading` 和 `#expired` 插槽替换默认蒙层内容。

## 主动下载

组件实例暴露 `download(fileName?, extension?)`，无需显示内置下载菜单也可以触发下载：

```vue
<script setup lang="ts">
import QrCode, { type QrCodeExpose } from '@/components/QrCode'

const qrCodeRef = ref<QrCodeExpose>()
</script>

<template>
  <QrCode ref="qrCodeRef" data="https://example.com" />
  <el-button @click="qrCodeRef?.download('invite-code', 'png')">下载 PNG</el-button>
</template>
```
