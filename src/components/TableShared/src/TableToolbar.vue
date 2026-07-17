<script setup lang="ts">
import { RefreshRight, Setting } from '@element-plus/icons-vue'

import type { TableToolbarColumn } from './types'

withDefaults(
  defineProps<{
    title?: string
    loading?: boolean
    showRefresh?: boolean
    showColumnController?: boolean
    columns?: TableToolbarColumn[]
    visibleColumnKeys?: string[]
  }>(),
  {
    title: '',
    loading: false,
    showRefresh: true,
    showColumnController: true,
    columns: () => [],
    visibleColumnKeys: () => [],
  },
)

const emit = defineEmits<{
  refresh: []
  'update:visibleColumnKeys': [keys: string[]]
}>()
</script>

<template>
  <div class="basic-table-toolbar">
    <div class="basic-table-toolbar__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <div class="basic-table-toolbar__actions">
      <slot name="actions" />

      <el-tooltip v-if="showRefresh" content="刷新" placement="top">
        <el-button text :disabled="loading" aria-label="刷新" @click="emit('refresh')">
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-tooltip>

      <el-popover
        v-if="showColumnController && columns.some((column) => column.hideable)"
        placement="bottom-end"
        trigger="click"
        :width="180"
      >
        <template #reference>
          <el-tooltip content="列设置" placement="top">
            <el-button text aria-label="列设置">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </template>

        <el-checkbox-group
          :model-value="visibleColumnKeys"
          class="basic-table-toolbar__columns"
          @update:model-value="emit('update:visibleColumnKeys', $event)"
        >
          <el-checkbox
            v-for="column in columns"
            :key="column.key"
            :value="column.key"
            :disabled="!column.hideable"
          >
            {{ column.title }}
          </el-checkbox>
        </el-checkbox-group>
      </el-popover>
    </div>
  </div>
</template>

<style scoped>
.basic-table-toolbar {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.basic-table-toolbar__title {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.basic-table-toolbar__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.basic-table-toolbar__columns {
  display: grid;
  gap: 8px;
}

.basic-table-toolbar__columns :deep(.el-checkbox) {
  margin-right: 0;
}
</style>
