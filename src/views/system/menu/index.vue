<script setup lang="ts">
import { ref } from 'vue'
import Search from '~icons/ep/search'
import { useMenu } from '@/views/system/menu/utils/hooks.tsx'
import SmartVirtualizedTable from '@/components/SmartVirtualizedTable'

const { form, columns, loading, dataList, onSearch, handleDelete, openUpdatePanel } = useMenu()

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
				<el-input v-model="form.title" placeholder="请输入角色名称" clearable />
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

		<SmartVirtualizedTable
			title="权限管理"
			:data="dataList"
			:columns="columns"
			:loading="loading"
			:expand-column-key="columns[0].dataKey"
			style="width: 100%"
			header-class="table-header-class"
			@refresh="onSearch"
		>
			<template #toolbarSlot>
				<el-button class="reset-margin" type="primary" @click="openUpdatePanel('新增')">
					<Icon icon="ep:circle-plus" /> 添加权限
				</el-button>
			</template>

			<!-- 操作列 -->
			<template #operation="{ rowData }">
				<!-- 修改 -->
				<el-button
					class="reset-margin"
					link
					type="primary"
					@click="openUpdatePanel('修改', rowData)"
				>
					<Icon icon="ep:edit-pen" /> 修改
				</el-button>

				<!-- 新增 -->
				<el-button
					class="reset-margin"
					link
					type="primary"
					@click="
						openUpdatePanel(
							'新增',
							undefined,
							rowData.children?.length + 1 || 1,
							rowData.id,
						)
					"
				>
					<Icon icon="ri:add-circle-line" /> 新增
				</el-button>

				<!-- 删除 -->
				<el-popconfirm
					placement="left"
					:title="`是否确认删除${rowData.title}这条数据${rowData?.children?.length > 0 ? '。注意下级菜单也会一并删除，请谨慎操作' : ''}`"
					@confirm="handleDelete(rowData)"
				>
					<template #reference>
						<el-button class="reset-margin" link type="primary">
							<Icon icon="ep:delete" /> 删除
						</el-button>
					</template>
				</el-popconfirm>
			</template>
		</SmartVirtualizedTable>
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

::v-global(.table-header-class .el-table-v2__header-cell) {
	color: var(--el-text-color-primary);
}

:deep(.menu-title div) {
	display: flex;
	align-items: center;
	gap: 5px;
}

:deep(.menu-title > div) {
	margin: 0 4px;
}

:deep(.menu-title .menu-title-text) {
	margin-bottom: 2px;
}
</style>
