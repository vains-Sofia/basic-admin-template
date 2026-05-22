<script setup lang="ts">
import { ref } from 'vue'
import Search from '~icons/ep/search'
import SmartTable from '@/components/SmartTable'
import { useStore } from '@/views/dine/store/utils/hooks.tsx'
import { StatusEnum } from '@/api/types/Enums.ts'

const {
	form,
	columns,
	loading,
	onSearch,
	dataList,
	pagination,
	handleDelete,
	openUpdatePanel,
	handleSizeChange,
	handleCurrentChange,
	handleSelectionChange,
} = useStore()

const searchForm = ref()
</script>

<template>
	<div>
		<el-form
			ref="searchForm"
			:inline="true"
			:model="form"
			class="p-4 pl-6 mb-2 search-form"
			style="background-color: var(--el-bg-color)"
		>
			<el-form-item label="关键字" prop="keyword">
				<el-input v-model="form.keyword" placeholder="搜索门店名称、地址" clearable />
			</el-form-item>
			<el-form-item label="状态" prop="status">
				<el-select v-model="form.status" placeholder="请选择状态" clearable>
					<el-option label="启用" :value="StatusEnum.ENABLE" />
					<el-option label="禁用" :value="StatusEnum.DISABLE" />
				</el-select>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSearch" :loading="loading" :icon="Search">
					查询
				</el-button>
				<el-button plain @click="() => searchForm?.resetFields()">
					<Icon icon="ep:refresh" /> 重置
				</el-button>
			</el-form-item>
		</el-form>

		<SmartTable
			title="门店管理"
			:data="dataList"
			:columns="columns"
			:loading="loading"
			:pagination="pagination"
			style="width: 100%"
			:header-cell-style="{
				color: 'var(--el-text-color-primary)',
			}"
			@refresh="onSearch"
			@selection-change="handleSelectionChange"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
		>
			<template #toolbarSlot>
				<el-button class="reset-margin" type="primary" @click="openUpdatePanel('新增')">
					<Icon icon="ep:circle-plus" /> 添加门店
				</el-button>
			</template>

			<template #operation="{ row }">
				<el-button
					class="reset-margin"
					link
					type="primary"
					@click="openUpdatePanel('修改', row)"
				>
					<Icon icon="ep:edit-pen" /> 修改
				</el-button>
				<el-popconfirm
					:title="`是否确认删除门店名称为${row.name}的这条数据`"
					@confirm="handleDelete(row)"
				>
					<template #reference>
						<el-button class="reset-margin" link type="primary">
							<Icon icon="ep:delete" /> 删除
						</el-button>
					</template>
				</el-popconfirm>
			</template>
		</SmartTable>
	</div>
</template>

<style scoped>
.el-form-item {
	margin-bottom: 0;
}

.search-form .el-input,
.search-form .el-select {
	--el-input-width: 200px;
	width: 200px;
}

span svg {
	margin-right: 5px;
}
</style>
