# ImageCropper

`ImageCropper` 基于 Cropper.js 2.x 封装，支持选择图片、缩放、旋转、水平/垂直翻转和实时裁剪预览。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

import ImageCropper from '@/components/ImageCropper'

const source = ref<string | File>('')
const result = ref<Blob>()
</script>

<template>
  <ImageCropper
    v-model="source"
    :width="400"
    :height="300"
    :aspect-ratio="4 / 3"
    mime-type="image/png"
    preserve-resolution
    @update:blob="result = $event"
  />
</template>
```

`modelValue` 支持图片 URL 或 `File`。用户通过组件选择文件时会触发 `update:modelValue`；每次裁剪变化后会触发 `update:blob` 和 `update:url`。

裁剪操作期间组件会先更新低分辨率预览；停止操作约 120ms 后，再生成原图分辨率结果并触发 `update:blob` 和 `update:url`。

默认开启 `preserveResolution`：组件会根据图片缩放矩阵，将屏幕上的裁剪区域换算成原图像素尺寸后输出；使用 PNG 时不会产生有损压缩。此时 `width`、`height` 控制裁剪框的初始尺寸，并在未传入 `aspectRatio` 时决定默认比例。

如需把结果统一缩放到固定像素尺寸，可传入 `:preserve-resolution="false"`，此时输出尺寸为 `width × height`。`quality` 的有效范围为 `0` 到 `1`，仅对 JPEG 和 WebP 重新编码生效；这两种格式即使质量设为 `1`，也无法保证与源文件二进制一致。

组件生成的 `update:url` 对象 URL 会在下一次裁剪或组件卸载时释放。需要长期保存结果时应使用 `update:blob`。
