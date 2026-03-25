<script setup lang="ts">
import { ref } from 'vue'
import Search from '~icons/ep/search'
import SmartTable from '@/components/SmartTable'
import { useRole } from '@/views/system/role/utils/hooks.tsx'

const {
	form,
	columns,
	loading,
	onSearch,
	dataList,
	pagination,
	handleDelete,
	openMenuPanel,
	openUpdatePanel,
	handleSizeChange,
	handleCurrentChange,
} = useRole()

const searchForm = ref()
</script>

<template>
	<div>
		<el-form
			inline
			ref="searchForm"
			:model="form"
			class="p-4 pl-6 mb-2 search-form"
			style="background-color: var(--el-bg-color)"
		>
			<el-form-item label="角色名称" prop="name">
				<el-input v-model="form.name" placeholder="请输入角色名称" clearable />
			</el-form-item>
			<el-form-item label="角色标识" prop="code">
				<el-input v-model="form.code" placeholder="请输入角色标识" clearable />
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
			title="角色管理"
			:data="dataList"
			:columns="columns"
			:loading="loading"
			:pagination="pagination"
			style="width: 100%"
			:header-cell-style="{
				color: 'var(--el-text-color-primary)',
			}"
			@refresh="onSearch"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
		>
			<template #toolbarSlot>
				<el-button class="reset-margin" type="primary" @click="openUpdatePanel('新增')">
					<Icon icon="ep:circle-plus" /> 添加角色
				</el-button>
			</template>

			<!-- 操作列 -->
			<template #operation="{ row }">
				<!-- 修改 -->
				<el-button
					class="reset-margin"
					link
					type="primary"
					@click="openUpdatePanel('修改', row)"
				>
					<Icon icon="ep:edit-pen" /> 修改
				</el-button>

				<!-- 删除 -->
				<el-popconfirm
					:title="`是否确认删除角色名称为${row.name}的这条数据`"
					@confirm="handleDelete(row)"
				>
					<template #reference>
						<el-button class="reset-margin" link type="primary">
							<Icon icon="ep:delete" /> 删除
						</el-button>
					</template>
				</el-popconfirm>

				<!-- 权限 -->
				<el-button class="reset-margin" link type="primary" @click="openMenuPanel(row)">
					<Icon icon="ep:menu" /> 权限
				</el-button>
			</template>
		</SmartTable>
	</div>
</template>

<style scoped>
.el-form-item {
	margin-bottom: 0;
}
.search-form .el-input {
	--el-input-width: 200px;
}

span svg {
	margin-right: 5px;
}
</style>
