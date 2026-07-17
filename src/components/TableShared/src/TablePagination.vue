<script setup lang="ts">
import type { BasicTablePagination } from './types'

const props = withDefaults(
  defineProps<{
    modelValue: BasicTablePagination
    layout?: string
    background?: boolean
  }>(),
  {
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [pagination: BasicTablePagination]
  'page-size-change': [pageSize: number]
  'page-change': [page: number]
}>()

function changePageSize(pageSize: number): void {
  emit('update:modelValue', { ...props.modelValue, pageSize, currentPage: 1 })
  emit('page-size-change', pageSize)
}

function changePage(currentPage: number): void {
  emit('update:modelValue', { ...props.modelValue, currentPage })
  emit('page-change', currentPage)
}
</script>

<template>
  <div class="basic-table-pagination">
    <el-pagination
      :background="background"
      :layout="layout"
      :current-page="modelValue.currentPage"
      :page-size="modelValue.pageSize"
      :page-sizes="modelValue.pageSizes ?? [10, 20, 50, 100]"
      :total="modelValue.total"
      @update:page-size="changePageSize"
      @update:current-page="changePage"
    />
  </div>
</template>

<style scoped>
.basic-table-pagination {
  display: flex;
  min-width: 0;
  justify-content: flex-end;
  padding-top: 12px;
  overflow-x: auto;
}
</style>
