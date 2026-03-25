<script setup lang="ts">
import { ref } from 'vue'
import Search from '~icons/ep/search'
import DictType from './DictType.vue'
import { useDict } from './utils/hooks'
import SmartTable from '@/components/SmartTable'

defineOptions({
	name: 'SystemDict',
})

const {
	form,
	loading,
	columns,
	onSearch,
	dataList,
	pagination,
	handleDelete,
	openUpdatePanel,
	handleSelectType,
	handleDeleteType,
	handleSizeChange,
	handleCurrentChange,
	handleSelectionChange
} = useDict()

const searchForm = ref()
</script>

<template>
	<div class="flex justify-between">
		<DictType class="min-w-[300px] mr-2" @select="handleSelectType" @delete="handleDeleteType" />
		<div class="w-[calc(100%-300px)]">
			<el-form
				ref="searchForm"
				:inline="true"
				:model="form"
				class="search-form w-[99/100] pl-8 pt-[19px] pb-[5px] mb-2 overflow-auto"
				style="background-color: var(--el-bg-color)"
			>
				<el-form-item label="关键字：" prop="keyword">
					<el-input
						v-model="form.keyword"
						placeholder="搜索字典项"
						clearable
						class="!w-[180px]"
					/>
				</el-form-item>
				<el-form-item label="状态：" prop="status">
					<el-select
						v-model="form.status"
						placeholder="请选择"
						clearable
						class="!w-[180px]"
					>
						<el-option label="启用" value="Y" />
						<el-option label="禁用" value="N" />
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
				title="用户管理"
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
						<Icon icon="ep:circle-plus" /> 添加字典项
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
						:title="`是否确认删除字典值为${row.itemName}的这条数据`"
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
	</div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
	margin: 0;
}

:deep(.el-button:focus-visible) {
	outline: none;
}

.main-content {
	margin: 24px 24px 0 !important;
}

.search-form {
	:deep(.el-form-item) {
		margin-bottom: 12px;
	}
}

span svg {
	margin-right: 5px;
}
</style>
