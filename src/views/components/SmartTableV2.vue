<template>
	<div>
		<SmartVirtualizedTable
			title="虚拟表格"
			:data="tableData"
			:columns="columns"
			:loading="loading"
			:sort-by="sortState"
			v-model:pagination="pagination"
			style="width: 100%"
			@column-sort="onColumnSort"
			@refresh="loadData"
			@sort-change="handleSortChange"
			@size-change="loadData"
			@current-change="loadData"
			@select="handleSelect"
			@select-all="handleSelectAll"
			@selection-change="handleSelectionChange"
		>
			<!-- 自定义单元格插槽 -->
			<template #name="{ rowData }">
				<el-tag>{{ rowData.name }}</el-tag>
			</template>

			<!-- 自定义表头插槽 -->
			<template #age-header>
				<span style="color: red">🔥 年龄</span>
			</template>

			<!-- 插槽写法 -->
			<template #edit-slot="{ rowData }">
				<el-button size="small" type="primary" @click="edit(rowData)">编辑</el-button>
				<el-button size="small" type="danger" @click="remove(rowData)">删除</el-button>
			</template>
		</SmartVirtualizedTable>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SmartVirtualizedTable, {
	type TableColumnV2,
	type TablePaginationV2,
} from '@/components/SmartVirtualizedTable'
import { sortByKey } from '@/utils/Common.ts'

import { type SortBy, TableV2SortOrder } from 'element-plus'

const tableData = ref<any[]>([])
const pagination = ref<TablePaginationV2>({
	currentPage: 1,
	pageSize: 3000,
	total: 0,
	pageSizes: [10, 20, 50, 100, 3000],
})

const loading = ref(false)

// 排序
const onColumnSort = (sortBy: SortBy) => {
	console.log(sortBy)
	tableData.value = sortByKey(tableData.value, sortBy.key, sortBy.order)
	sortState.value = sortBy
}

// 排序方式
const sortState = ref<SortBy>({
	key: 'age2',
	order: TableV2SortOrder.ASC,
})

const handleSelectionChange = (rows: any[]) => {
	console.log('选中行：', rows)
}

const handleSelectAll = (rows: any[]) => {
	console.log(rows)
}

const handleSelect = (rows: any[], row: any) => {
	console.log(rows, row)
}

// 表格列
const columns: TableColumnV2[] = [
	{
		key: 'index',
		dataKey: 'index',
		selection: true,
		width: 50
	},
	{
		key: 'name',
		dataKey: 'name',
		title: '姓名',
		slot: 'name',
		align: 'center',
	},
	{
		key: 'age',
		dataKey: 'age',
		title: '年龄',
		align: 'center',
		sortable: true,
		headerSlot: 'age-header',
	},
	{
		key: 'age1',
		dataKey: 'age1',
		title: '年龄1',
		align: 'center',
	},
	{
		key: 'age2',
		dataKey: 'age2',
		title: '年龄2',
		align: 'center',
		sortable: true,
	},
	{
		key: 'age3',
		dataKey: 'age3',
		title: '年龄3',
		align: 'center',
	},
	{
		key: 'age4',
		dataKey: 'age4',
		title: '年龄4',
		align: 'center',
	},
	{
		key: 'age5',
		dataKey: 'age5',
		title: '年龄5',
		align: 'center',
	},
	{
		key: 'age6',
		dataKey: 'age6',
		title: '年龄6',
		align: 'center',
	},
	{
		key: 'age7',
		dataKey: 'age7',
		title: '年龄7',
		align: 'center',
	},
	{
		dataKey: 'edit-col',
		title: '操作',
		slot: 'edit-slot',
		width: 150,
	},
]

const handleSortChange = (sort: any) => {
	console.log('排序参数：', sort)
	loadData()
}

const edit = (row: any) => {
	console.log('编辑', row)
}

const remove = (row: any) => {
	console.log('删除', row)
}

const loadData = () => {
	loading.value = true
	// 模拟请求
	setTimeout(() => {
		pagination.value.total = 10000
		tableData.value = Array.from({ length: pagination.value.pageSize }).map((_, i) => ({
			id: (pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1,
			name: `用户 ${(pagination.value.currentPage - 1) * pagination.value.pageSize + i + 1}`,
			age: 18 + Math.floor(Math.random() * 10),
			age1: 18 + Math.floor(Math.random() * 10),
			age2: 18 + Math.floor(Math.random() * 10),
			age3: 18 + Math.floor(Math.random() * 10),
			age4: 18 + Math.floor(Math.random() * 10),
			age5: 18 + Math.floor(Math.random() * 10),
			age6: 18 + Math.floor(Math.random() * 10),
			age7: 18 + Math.floor(Math.random() * 10),
		}))
		loading.value = false
	}, 500)
}

loadData()
</script>
