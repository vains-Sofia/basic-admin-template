<script setup lang="ts">
import { ref } from 'vue'
import Search from '~icons/ep/search'
import { useUser } from './utils/hooks.tsx'
import SmartTable from '@/components/SmartTable'

const {
	form,
	loading,
	columns,
	dataList,
	onSearch,
	pagination,
	handleReset,
	handleDelete,
	handleUpload,
	openUpdatePanel,
	handleUserRoles,
	handleSizeChange,
	handleCurrentChange,
	handleSelectionChange,
} = useUser()

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
			<el-form-item label="用户名称" prop="nickname">
				<el-input v-model="form.nickname" placeholder="请输入用户名称" clearable />
			</el-form-item>
			<el-form-item label="用户邮箱" prop="email">
				<el-input v-model="form.email" placeholder="请输入用户邮箱" clearable />
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
					<Icon icon="ep:circle-plus" /> 添加用户
				</el-button>
			</template>

			<!-- 操作列 -->
			<el-table-column label="操作" width="180">
				<template #default="{ row }">
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
						:title="`是否确认删除用户编号为${row.id}的这条数据`"
						@confirm="handleDelete(row)"
					>
						<template #reference>
							<el-button class="reset-margin" link type="primary">
								<Icon icon="ep:delete" /> 删除
							</el-button>
						</template>
					</el-popconfirm>

					<!-- 更多 -->
					<el-dropdown>
						<el-button class="ml-3 mt-[2px]" link type="primary">
							<Icon icon="ep:more-filled" />
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item>
									<ElUpload
										accept="image/*"
										:show-file-list="false"
										:before-upload="(file) => handleUpload(file, row)"
									>
										<Icon icon="ep:upload" /> 上传头像
									</ElUpload>
								</el-dropdown-item>
								<el-dropdown-item @click="handleReset(row)">
									<Icon icon="ri:lock-password-line" /> 重置密码
								</el-dropdown-item>
								<el-dropdown-item @click="handleUserRoles(row)">
									<Icon icon="ri:admin-line" /> 分配角色
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</template>
			</el-table-column>
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
