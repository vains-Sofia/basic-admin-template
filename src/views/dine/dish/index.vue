<script setup lang="ts">
import { ref } from 'vue'
import Search from '~icons/ep/search'
import SmartTable from '@/components/SmartTable'
import StoreList from '@/views/dine/attribute/StoreList.vue'
import CategoryList from './CategoryList.vue'
import { useDish } from './utils/hooks'
import type { FindCategoryResponse } from '@/api/types/CategoryTypes.ts'
import type { FindStoreResponse } from '@/api/types/StoreTypes.ts'

defineOptions({
	name: 'DineDish',
})

const storeId = ref('')
const searchForm = ref()

const {
	form,
	columns,
	loading,
	onSearch,
	dataList,
	pagination,
	handleDelete,
	openUpdatePanel,
	handleStoreChange,
	handleSelectCategory,
	handleDeleteCategory,
	handleReset,
	handleSizeChange,
	handleCurrentChange,
	handleSelectionChange,
} = useDish()

const handleSelectStore = (store: FindStoreResponse) => {
	storeId.value = store.id
	handleStoreChange(store.id)
}

const handleCategoryDelete = (category: FindCategoryResponse) => {
	if (form.categoryId === category.id) {
		handleDeleteCategory()
	}
}
</script>

<template>
	<div class="dish-page flex justify-between">
		<div class="dish-sidebar min-w-[300px] mr-2 flex flex-col gap-2">
			<StoreList @select="handleSelectStore" />
			<CategoryList
				class="dish-category-list"
				:store-id="storeId"
				@select="handleSelectCategory"
				@delete="handleCategoryDelete"
				@clear="handleDeleteCategory"
			/>
		</div>

		<div class="min-w-0 flex-1">
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
						placeholder="搜索菜品名称"
						clearable
						class="!w-[180px]"
					/>
				</el-form-item>
				<el-form-item>
					<el-button
						type="primary"
						@click="onSearch(true)"
						:loading="loading"
						:icon="Search"
					>
						查询
					</el-button>
					<el-button plain @click="handleReset">
						<Icon icon="ep:refresh" /> 重置
					</el-button>
				</el-form-item>
			</el-form>

			<SmartTable
				title="菜品管理"
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
						<Icon icon="ep:circle-plus" /> 添加菜品
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
						:title="`是否确认删除菜品名称为${row.name}的这条数据`"
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
.dish-page {
	height: 100%;
	min-height: 0;
}

.dish-sidebar {
	height: 100%;
	min-height: 0;
}

.dish-category-list {
	flex: 1;
	min-height: 0;
}

:deep(.el-dropdown-menu__item i) {
	margin: 0;
}

:deep(.el-button:focus-visible) {
	outline: none;
}

.search-form {
	:deep(.el-form-item) {
		margin-bottom: 12px;
	}
}

span svg {
	margin-right: 5px;
}

.el-form-item {
	margin-bottom: 0;
}

.search-form .el-input,
.search-form .el-select {
	--el-input-width: 200px;
	width: 200px;
}
</style>
