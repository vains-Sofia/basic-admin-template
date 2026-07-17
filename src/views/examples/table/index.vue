<script setup lang="ts">
import { computed, ref } from 'vue'

import BasicTable, {
  type BasicTableColumn,
  type BasicTableKey,
  type BasicTablePagination,
} from '@/components/BasicTable'
import BasicTableV2 from '@/components/BasicTableV2'

defineOptions({ name: 'TableExamples' })

interface ExampleUser {
  id: number
  name: string
  department: string
  status: '启用' | '停用'
  updatedAt: string
}

const tableType = ref<'standard' | 'virtual'>('standard')
const loading = ref(false)
const selectedKeys = ref<BasicTableKey[]>([])
const pagination = ref<BasicTablePagination>({
  currentPage: 1,
  pageSize: 20,
  total: 100,
})

const rows: ExampleUser[] = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `示例用户 ${String(index + 1).padStart(2, '0')}`,
  department: ['产品中心', '研发中心', '运营中心'][index % 3] ?? '研发中心',
  status: index % 5 === 0 ? '停用' : '启用',
  updatedAt: `2026-07-${String((index % 17) + 1).padStart(2, '0')} 10:30`,
}))

const columns: BasicTableColumn<ExampleUser>[] = [
  { key: 'selection', type: 'selection', width: 48 },
  { key: 'index', type: 'index', title: '序号', width: 64 },
  { dataKey: 'name', title: '姓名', minWidth: 160, sortable: true },
  { dataKey: 'department', title: '部门', minWidth: 140 },
  { dataKey: 'status', title: '状态', width: 100 },
  { dataKey: 'updatedAt', title: '更新时间', minWidth: 180, showOverflowTooltip: true },
]

const pageRows = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  return rows.slice(start, start + pagination.value.pageSize)
})

async function refresh(): Promise<void> {
  loading.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 500))
  loading.value = false
}
</script>

<template>
  <div class="table-example-page">
    <header class="table-example-page__header">
      <h1 class="page-title">表格示例</h1>
      <el-segmented
        v-model="tableType"
        :options="[
          { label: '基础表格', value: 'standard' },
          { label: '虚拟表格', value: 'virtual' },
        ]"
      />
    </header>

    <BasicTable
      v-if="tableType === 'standard'"
      v-model:pagination="pagination"
      v-model:selected-keys="selectedKeys"
      :data="pageRows"
      :columns="columns"
      :loading="loading"
      :table-props="{ stripe: true }"
      row-key="id"
      title="BasicTable"
      @refresh="refresh"
    />

    <BasicTableV2
      v-else
      v-model:pagination="pagination"
      v-model:selected-keys="selectedKeys"
      :data="pageRows"
      :columns="columns"
      :loading="loading"
      :table-props="{ rowHeight: 46, headerHeight: 46 }"
      row-key="id"
      title="BasicTableV2"
      @refresh="refresh"
    />
  </div>
</template>

<style scoped>
.table-example-page {
  min-width: 0;
}

.table-example-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

@media (max-width: 560px) {
  .table-example-page__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
