<template>
	<div class="category-manager">
		<div ref="operationBar" class="operation-bar">
			<el-input
				v-model="searchKeyword"
				v-debounce:input="{ handler: handleSearch, wait: 400 }"
				placeholder="搜索菜单分类"
				clearable
				:disabled="!storeId"
				@clear="handleSearch"
			>
				<template #prefix>
					<el-icon>
						<Icon icon="ep:search" />
					</el-icon>
				</template>
			</el-input>

			<div class="operation-buttons">
				<el-button type="primary" @click="handleAdd">
					<Icon icon="ep:plus" class="mr-1" />
					新增
				</el-button>
			</div>
		</div>

		<div class="category-list-container">
			<el-scrollbar ref="categoryScrollbar" class="category-scrollbar">
				<div class="category-list">
					<el-empty v-if="!storeId" description="请选择门店" />

					<template v-else>
						<div
							v-for="item in categoryList"
							:key="item.id"
							class="category-item"
							:class="{ active: selectedId === String(item.id) }"
							@click="selectCategory(item)"
						>
							<div class="category-info">
								<div class="category-name">{{ item.name }}</div>
								<div class="category-meta">
									排序：{{ item.sort }} ·
									{{ item.status === StatusEnum.ENABLE ? '启用' : '禁用' }}
								</div>
							</div>
							<div class="category-actions">
								<el-button text size="small" @click.stop="handleEdit(item)">
									<el-icon>
										<Icon icon="ep:edit" />
									</el-icon>
								</el-button>
								<el-button text size="small" @click.stop="handleDelete(item)">
									<el-icon>
										<Icon icon="ep:delete" />
									</el-icon>
								</el-button>
							</div>
						</div>

						<div v-if="loading" class="loading-container">
							<el-icon class="is-loading">
								<Icon icon="ep:loading" />
							</el-icon>
							<span>加载中...</span>
						</div>

						<div v-show="!noMore" ref="loadTrigger" class="load-trigger" />

						<div v-if="noMore && categoryList.length > 0" class="no-more">
							没有更多数据了
						</div>

						<el-empty
							v-if="categoryList.length === 0 && !loading"
							description="暂无分类"
						/>
					</template>
				</div>
			</el-scrollbar>
		</div>

		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
			<el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
				<el-form-item label="所属门店" prop="storeId">
					<el-input v-model="form.storeId" disabled placeholder="请先选择门店" />
				</el-form-item>
				<el-form-item label="分类名称" prop="name">
					<el-input v-model="form.name" clearable placeholder="请输入分类名称" />
				</el-form-item>
				<el-form-item label="排序值" prop="sort">
					<el-input-number
						v-model="form.sort"
						class="!w-full"
						:min="0"
						:max="9999"
						controls-position="right"
					/>
				</el-form-item>
				<el-form-item label="分类状态" prop="status">
					<el-radio-group v-model="form.status">
						<el-radio-button :value="StatusEnum.ENABLE">启用</el-radio-button>
						<el-radio-button :value="StatusEnum.DISABLE">禁用</el-radio-button>
					</el-radio-group>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="handleSubmit">确定</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { FormRules, ScrollbarInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDebounce } from '@/hooks/useDebounce.ts'
import {
	createCategory,
	deleteCategory,
	pageCategory,
	updateCategory,
} from '@/api/dine/Category.ts'
import type { CategoryRequest, FindCategoryResponse } from '@/api/types/CategoryTypes.ts'
import { StatusEnum } from '@/api/types/Enums.ts'

const props = defineProps<{
	storeId: string
}>()

const emit = defineEmits<{
	select: [category: FindCategoryResponse]
	delete: [category: FindCategoryResponse]
	clear: []
}>()

const pageSize = ref(15)
const noMore = ref(true)
const currentPage = ref(1)
const loading = ref(false)
const categoryList = ref<FindCategoryResponse[]>([])
const selectedId = ref('')
const searchKeyword = ref('')
const categoryScrollbar = ref<ScrollbarInstance>()
const operationBar = ref()
const loadTrigger = ref<HTMLElement | null>(null)

const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单分类')
const formRef = ref<InstanceType<any>>(null)
const form = reactive({
	id: '',
	storeId: '',
	name: '',
	sort: 0,
	status: StatusEnum.ENABLE,
})

const rules = reactive<FormRules>({
	storeId: [{ required: true, message: '请选择所属门店', trigger: 'change' }],
	name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
})

const handleCategoryScrollbarResize = useDebounce(() => {
	const wrapRef = categoryScrollbar.value?.wrapRef
	if (wrapRef && wrapRef.style) {
		wrapRef.style.height = `${window.innerHeight - operationBar.value?.getBoundingClientRect().top - 101}px`
	}
}, 60)

const buildCategoryRequest = (): CategoryRequest => ({
	storeId: form.storeId,
	name: form.name,
	sort: form.sort,
	status: form.status,
})

const loadCategories = async (reset = false) => {
	if (loading.value) return

	if (!props.storeId) {
		categoryList.value = []
		selectedId.value = ''
		noMore.value = true
		return
	}

	loading.value = true

	try {
		if (reset) {
			currentPage.value = 1
			noMore.value = false
		}

		const result = await pageCategory({
			current: currentPage.value,
			size: pageSize.value,
			keyword: searchKeyword.value,
			storeId: props.storeId,
		})

		if (reset) {
			categoryList.value = result.records
		} else {
			categoryList.value.push(...result.records)
		}

		noMore.value = !result.records || result.records.length === 0

		if (!noMore.value) {
			currentPage.value++
		}
	} catch {
		noMore.value = true
	} finally {
		loading.value = false
	}
}

const handleSearch = () => {
	loadCategories(true)
}

const selectCategory = (item: FindCategoryResponse) => {
	selectedId.value = String(item.id)
	emit('select', item)
}

const resetForm = () => {
	form.id = ''
	form.storeId = props.storeId
	form.name = ''
	form.sort = 0
	form.status = StatusEnum.ENABLE
	nextTick(() => formRef.value?.clearValidate())
}

const handleAdd = () => {
	if (!props.storeId) {
		ElMessage.warning('请先选择门店')
		return
	}

	dialogTitle.value = '新增菜单分类'
	resetForm()
	dialogVisible.value = true
}

const handleEdit = (item: FindCategoryResponse) => {
	dialogTitle.value = '编辑菜单分类'
	form.id = String(item.id)
	form.storeId = String(item.storeId)
	form.name = item.name
	form.sort = item.sort
	form.status = item.status
	dialogVisible.value = true
}

const handleDelete = (item: FindCategoryResponse) => {
	ElMessageBox.confirm(`确定要删除菜单分类“${item.name}”吗？`, '删除确认', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
		draggable: true,
	})
		.then(() => {
			deleteCategory(item.id).then(() => {
				categoryList.value = categoryList.value.filter(
					(category) => category.id !== item.id,
				)
				if (selectedId.value === String(item.id)) {
					selectedId.value = ''
					emit('clear')
				}
				ElMessage.success('删除成功')
				emit('delete', item)
			})
		})
		.catch(() => {})
}

const handleSubmit = () => {
	formRef.value?.validate((valid: boolean) => {
		if (!valid) return

		const data = buildCategoryRequest()
		if (form.id) {
			updateCategory(form.id, data).then((res) => {
				const index = categoryList.value.findIndex((item) => item.id === res.id)
				if (index > -1) {
					categoryList.value[index] = res
				}
				ElMessage.success('编辑成功')
				dialogVisible.value = false
				resetForm()
			})
		} else {
			createCategory(data).then((res) => {
				categoryList.value.unshift(res)
				ElMessage.success('新增成功')
				dialogVisible.value = false
				resetForm()
			})
		}
	})
}

watch(
	() => props.storeId,
	() => {
		selectedId.value = ''
		searchKeyword.value = ''
		form.storeId = props.storeId
		emit('clear')
		loadCategories(true)
	},
)

onMounted(() => {
	handleCategoryScrollbarResize()
	window.addEventListener('resize', handleCategoryScrollbarResize)
	loadCategories(true)
})

onUnmounted(() => {
	window.removeEventListener('resize', handleCategoryScrollbarResize)
})

useIntersectionObserver(loadTrigger, ([{ isIntersecting }]) => {
	if (isIntersecting && !loading.value && !noMore.value) {
		loadCategories(false)
	}
})
</script>

<style scoped>
.category-manager {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.operation-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 19px;
	background: var(--el-bg-color);
	border-bottom: 1px solid var(--el-border-color-light);
	flex-shrink: 0;
}

.operation-buttons {
	display: flex;
	margin-left: 15px;
}

.category-list-container {
	flex: 1;
	background: var(--el-bg-color);
	min-height: 0;
}

.category-scrollbar {
	height: 100%;
}

.category-scrollbar :deep(.el-scrollbar__view) {
	height: 100%;
}

.category-list {
	padding: 15px;
}

.category-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	margin-bottom: 8px;
	background: var(--el-fill-color-blank);
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 1px solid var(--el-border-color-lighter);
}

.category-item:hover:not(.active) {
	background: var(--el-fill-color);
	border-color: var(--el-border-color-light);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
}

.category-item.active {
	background: linear-gradient(
		135deg,
		var(--el-color-primary-light-9) 0%,
		var(--el-fill-color-blank) 100%
	);
	border: 1px solid var(--el-color-primary-light-3);
	box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.15);
}

.category-info {
	flex: 1;
	min-width: 0;
	overflow: hidden;
}

.category-name {
	font-size: 14px;
	font-weight: 500;
	color: var(--el-text-color-primary);
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.category-meta {
	font-size: 12px;
	color: var(--el-text-color-regular);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.category-actions {
	display: flex;
	flex-shrink: 0;
	margin-left: 8px;

	.el-button + .el-button {
		margin-left: 0;
	}
}

.loading-container {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px;
	color: var(--el-text-color-regular);
	font-size: 14px;
}

.loading-container .el-icon {
	margin-right: 8px;
}

.no-more {
	text-align: center;
	padding: 16px;
	color: var(--el-text-color-placeholder);
	font-size: 12px;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.load-trigger {
	height: 1px;
}
</style>
