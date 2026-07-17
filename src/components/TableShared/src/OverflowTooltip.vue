<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ content?: unknown }>()
const contentRef = ref<HTMLElement>()
const overflowed = ref(false)

function checkOverflow(): void {
  const element = contentRef.value
  overflowed.value = Boolean(element && element.scrollWidth > element.clientWidth)
}
</script>

<template>
  <el-tooltip :content="String(props.content ?? '')" :disabled="!overflowed" placement="top">
    <div ref="contentRef" class="basic-table-overflow" @mouseenter="checkOverflow">
      <slot>{{ props.content }}</slot>
    </div>
  </el-tooltip>
</template>

<style scoped>
.basic-table-overflow {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
