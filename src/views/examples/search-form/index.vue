<script setup lang="ts">
import { ref, reactive } from 'vue'

import BasicSearchForm, { type BasicSearchField } from '@/components/BasicSearchForm'

defineOptions({ name: 'SearchFormExamples' })

interface SearchQuery {
  keyword: string
  department: string
  status: string
  level: string
}

interface ResultRow {
  id: number
  name: string
  department: string
  status: string
  level: string
}

const query = reactive<SearchQuery>({ keyword: '', department: '', status: '', level: '' })
const loading = ref(false)
const resultRows = ref<ResultRow[]>([])
const allRows: ResultRow[] = [
  { id: 1, name: '林晓', department: '产品中心', status: '启用', level: '高级' },
  { id: 2, name: '周宁', department: '研发中心', status: '启用', level: '中级' },
  { id: 3, name: '沈言', department: '运营中心', status: '停用', level: '初级' },
  { id: 4, name: '许安', department: '研发中心', status: '启用', level: '高级' },
]

const schema: BasicSearchField[] = [
  {
    field: 'keyword',
    label: '关键词',
    type: 'input',
    props: { clearable: true, placeholder: '姓名', style: 'width: 180px' },
  },
  {
    field: 'department',
    label: '部门',
    type: 'select',
    options: [
      { label: '产品中心', value: '产品中心' },
      { label: '研发中心', value: '研发中心' },
      { label: '运营中心', value: '运营中心' },
    ],
    props: { clearable: true, placeholder: '全部部门', style: 'width: 150px' },
  },
  {
    field: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '启用', value: '启用' },
      { label: '停用', value: '停用' },
    ],
    props: { clearable: true, placeholder: '全部状态', style: 'width: 130px' },
  },
  {
    field: 'level',
    label: '职级',
    type: 'select',
    options: [
      { label: '初级', value: '初级' },
      { label: '中级', value: '中级' },
      { label: '高级', value: '高级' },
    ],
    props: { clearable: true, placeholder: '全部职级', style: 'width: 130px' },
  },
]

async function search(): Promise<void> {
  loading.value = true
  await new Promise((resolve) => window.setTimeout(resolve, 350))
  const keyword = query.keyword.trim()
  resultRows.value = allRows.filter((row) =>
    (!keyword || row.name.includes(keyword)) &&
    (!query.department || row.department === query.department) &&
    (!query.status || row.status === query.status) &&
    (!query.level || row.level === query.level),
  )
  loading.value = false
}

function reset(): void {
  Object.assign(query, { keyword: '', department: '', status: '', level: '' })
}
</script>

<template>
  <div class="search-form-example-page">
    <header>
      <h1 class="page-title">BasicSearchForm</h1>
      <p>折叠查询、重置、loading 和结果联动</p>
    </header>

    <section class="page-section">
      <BasicSearchForm
        :model="query"
        :schema="schema"
        :loading="loading"
        @search="search"
        @reset="reset"
      />
    </section>

    <section class="page-section">
      <el-table v-loading="loading" :data="resultRows" empty-text="暂无匹配结果">
        <el-table-column prop="name" label="姓名" min-width="140" />
        <el-table-column prop="department" label="部门" min-width="160" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="level" label="职级" width="100" />
      </el-table>
    </section>
  </div>
</template>

<style scoped>
.search-form-example-page {
  display: grid;
  gap: 14px;
}

.search-form-example-page header p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
}
</style>
