<template>
	<div>
		<SmartTable
			title="表格"
			:data="tableData"
			:columns="columns"
			:loading="loading"
			v-model:pagination="pagination"
			style="width: 100%"
			@refresh="loadData"
			@select="handleSelect"
			@select-all="handleSelectAll"
			@selection-change="handleSelectionChange"
			@sort-change="handleSortChange"
			@size-change="loadData"
			@current-change="loadData"
		>
			<!-- 自定义单元格插槽 -->
			<template #name="{ row }">
				<el-tag>{{ row.name }}</el-tag>
			</template>

			<!-- 自定义表头插槽 -->
			<template #age-header>
				<span style="color: red">🔥 年龄</span>
			</template>

			<!-- 原生写法 -->
			<el-table-column label="操作" width="180">
				<template #default="{ row }">
					<el-button size="small" @click="edit(row)">编辑</el-button>
					<el-button size="small" type="danger" @click="remove(row)">删除</el-button>
				</template>
			</el-table-column>
		</SmartTable>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SmartTable, { type TableColumn, type TablePagination } from '@/components/SmartTable'

const tableData = ref<any[]>([])
const pagination = ref<TablePagination>({
	currentPage: 1,
	pageSize: 50,
	total: 0,
	pageSizes: [10, 20, 50],
})

const loading = ref(false)

const columns: TableColumn[] = [
	{
		dataKey: 'index',
		type: 'selection',
		width: 50,
	},
	{
		dataKey: 'name',
		title: '姓名',
		showOverflowTooltip: true,
		slot: 'name',
	},
	{
		dataKey: 'age',
		title: '年龄',
		align: 'center',
		sortable: true,
		headerSlot: 'age-header',
	},
	{
		dataKey: 'age1',
		title: '年龄1',
		align: 'center',
	},
	{
		dataKey: 'age2',
		title: '年龄2',
		align: 'center',
	},
	{
		dataKey: 'age3',
		title: '年龄3',
		align: 'center',
	},
	{
		dataKey: 'age4',
		title: '年龄4',
		align: 'center',
	},
	{
		dataKey: 'age5',
		title: '年龄5',
		align: 'center',
		formatter: (row) => row.age5 * 3 + '',
	},
	{
		dataKey: 'age6',
		title: '年龄6',
		align: 'center',
		formatter: (row) => row.age6 * 3 + '',
	},
	{
		dataKey: 'age7',
		title: '年龄7',
		align: 'center',
		formatter: (row) => row.age7 * 3 + '',
	},
]

const handleSelectionChange = (rows: any[]) => {
	console.log('选中行：', rows)
}

const handleSelectAll = (rows: any[]) => {
	console.log(rows)
}

const handleSelect = (rows: any, row: any) => {
	console.log(rows, row)
}

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
		pagination.value.total = 100
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
