<template>
	<div class="attribute-group-manager">
		<!-- 操作栏 -->
		<div ref="operationBar" class="operation-bar">
			<el-input
				v-model="searchKeyword"
				v-debounce:input="{ handler: handleSearch, wait: 400 }"
				placeholder="搜索属性组"
				clearable
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

		<!-- 属性组列表 -->
		<div class="attribute-group-list-container">
			<el-scrollbar ref="attributeGroupScrollbar" class="attribute-group-scrollbar">
				<div>
					<div
						v-for="item in attributeGroupList"
						:key="item.id"
						class="attribute-group-item"
						:class="{ active: selectedId === item.id }"
						@click="selectAttributeGroup(item)"
					>
						<div class="attribute-group-info">
							<!--							<div class="attribute-group-name" style="max-width: 60%">-->
							<!--								<text-tooltip :content="item.name" />-->
							<!--							</div>-->
							<div class="attribute-group-name">{{ item.name }}</div>
							<div class="attribute-group-type">
								{{ item.selectType === 1 ? '单选' : '多选' }}
							</div>
						</div>
						<div class="attribute-group-actions">
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

					<!-- 加载状态 -->
					<div v-if="loading" class="loading-container">
						<el-icon class="is-loading">
							<Icon icon="ep:loading" />
						</el-icon>
						<span>加载中...</span>
					</div>

					<div v-show="!noMore" ref="loadTrigger" class="load-trigger" />

					<!-- 无更多数据 -->
					<div v-if="noMore && attributeGroupList.length > 0" class="no-more">
						没有更多数据了
					</div>

					<!-- 空数据 -->
					<el-empty
						v-if="attributeGroupList.length === 0 && !loading"
						description="暂无数据"
					/>
				</div>
			</el-scrollbar>
		</div>

		<!-- 新增/编辑弹窗 -->
		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
			<el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
				<el-form-item label="所属门店" prop="storeId">
					<remote-select-v2 :fetch-function="fetchStores" :modelValue="form.storeId" />
				</el-form-item>
				<el-form-item label="属性组名称" prop="name">
					<el-input v-model="form.name" placeholder="请输入属性组名称名称" />
				</el-form-item>
				<el-form-item label="属性组类型" prop="selectType">
					<el-segmented
						:modelValue="form.selectType"
						:options="selectTypeOptions"
						@change="
							(value: any) => {
								form.selectType = value
							}
						"
					/>
				</el-form-item>
				<el-form-item label="属性组排序" prop="sort">
					<el-input-number
						v-model="form.sort"
						class="!w-full"
						:min="1"
						:max="9999"
						controls-position="right"
					/>
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
import type { ScrollbarInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useDebounce } from '@/hooks/useDebounce.ts'
import type { FindAttributeGroupResponse } from '@/api/types/AttributeGroupTypes.ts'
import { createGroup, deleteGroup, pageGroup, updateGroup } from '@/api/dine/AttributeGroup.ts'
import { selectTypeOptions } from '@/views/system/menu/utils/enums.ts'
import { pageStore } from '@/api/dine/Store.ts'

// 响应式数据
const pageSize = ref(15)
const noMore = ref(false)
const currentPage = ref(1)
const loading = ref(false)
const attributeGroupList = ref<FindAttributeGroupResponse[]>([])
const selectedId = ref<string>()
const searchKeyword = ref('')

// 滚动列表
const attributeGroupScrollbar = ref<ScrollbarInstance>()
// 操作栏
const operationBar = ref()

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增属性组')
const formRef = ref<InstanceType<any>>(null)
const form = reactive({
	id: '',
	name: '',
	selectType: 1,
	sort: 0,
	storeId: '',
})

// 表单验证规则
const rules = {
	name: [{ required: true, message: '请输入属性组名称', trigger: 'blur' }],
	storeId: [{ required: true, message: '请选择门店', trigger: 'blur' }],
	selectType: [{ required: true, message: '请选择属性组类型', trigger: 'blur' }],
}

// 自适应调整滚动列表高度
const handleAttributeGroupScrollbarResize = useDebounce(() => {
	const wrapRef = attributeGroupScrollbar.value?.wrapRef
	if (wrapRef && wrapRef.style) {
		wrapRef.style.height = `${window.innerHeight - operationBar.value?.getBoundingClientRect().top - 101}px`
	}
}, 60)

// 事件定义
const emit = defineEmits(['select', 'add', 'edit', 'delete', 'refresh'])
const { storeId = '' } = defineProps<{
	storeId: string
}>()

// 分页查询
const fetchAttributeGroups = async (current = 1, size = 12, keyword = '') => {
	return pageGroup({ current, size, keyword, storeId })
}

// 查询门店
const fetchStores = async (params: any) => {
	return pageStore(params)
}

// 加载属性组列表
const loadAttributeGroups = async (reset = false) => {
	if (loading.value) return

	loading.value = true

	try {
		if (reset) {
			currentPage.value = 1
			noMore.value = false
		}

		const result = await fetchAttributeGroups(
			currentPage.value,
			pageSize.value,
			searchKeyword.value,
		)

		if (reset) {
			attributeGroupList.value = result.records
		} else {
			attributeGroupList.value.push(...result.records)
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

watch(
	() => storeId,
	() => {
		loadAttributeGroups(true)
		console.log(storeId)
		form.storeId = storeId
	},
)

// 搜索处理
const handleSearch = () => {
	loadAttributeGroups(true)
}

// 选择属性组
const selectAttributeGroup = (item: FindAttributeGroupResponse) => {
	selectedId.value = item.id
	emit('select', item)
}

// 新增属性组
const handleAdd = () => {
	dialogTitle.value = '新增属性组'
	resetForm()
	dialogVisible.value = true
}

// 编辑属性组
const handleEdit = (item: FindAttributeGroupResponse) => {
	dialogTitle.value = '编辑属性组'
	form.id = item.id
	form.name = item.name
	form.storeId = item.storeId
	form.selectType = item.selectType
	form.sort = item.sort
	dialogVisible.value = true
}

// 删除属性组
const handleDelete = (item: FindAttributeGroupResponse) => {
	ElMessageBox.confirm(
		`确定要删除属性组"${item.name}"吗？<br />注意：关联的属性项也会被删除！`,
		'删除确认',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			dangerouslyUseHTMLString: true,
			type: 'warning',
		},
	)
		.then(() => {
			deleteGroup(item.id).then(() => {
				const index = attributeGroupList.value.findIndex((group) => group.id === item.id)
				if (index > -1) {
					attributeGroupList.value.splice(index, 1)
				}
				ElMessage.success('删除成功')
				emit('delete', item)
			})
		})
		.catch(() => {
			// 取消删除
		})
}

// 提交表单
const handleSubmit = () => {
	formRef.value?.validate((valid: unknown) => {
		if (valid) {
			const isEdit = !!form.id

			if (isEdit) {
				updateGroup(form.id, form).then((res) => {
					// 编辑操作
					const index = attributeGroupList.value.findIndex((item) => item.id === res.id)
					if (index > -1) {
						attributeGroupList.value[index] = { ...res }
					}
					ElMessage.success('编辑成功')
					emit('edit', { ...form })
					dialogVisible.value = false
					resetForm()
				})
			} else {
				// 新增操作
				createGroup(form).then((res) => {
					const newItem = { ...res }
					attributeGroupList.value.unshift(newItem)
					ElMessage.success('新增成功')
					emit('add', newItem)
					dialogVisible.value = false
					resetForm()
				})
			}
		}
	})
}

// 重置表单
const resetForm = () => {
	const tempStoreId = form.storeId
	form.id = ''
	form.name = ''
	form.selectType = 1
	form.sort = 0
	nextTick(() => {
		formRef.value?.clearValidate()
		form.storeId = tempStoreId
	})
}

// 初始化
onMounted(() => {
	handleAttributeGroupScrollbarResize()
	window.addEventListener('resize', handleAttributeGroupScrollbarResize)
	loadAttributeGroups(true)
})

// 取消挂载之前
onUnmounted(() => {
	window.removeEventListener('resize', handleAttributeGroupScrollbarResize)
})

const loadTrigger = ref<HTMLElement | null>(null)

// 加载更多
useIntersectionObserver(loadTrigger, ([{ isIntersecting }]) => {
	if (isIntersecting && !loading.value && !noMore.value) {
		loadAttributeGroups(false)
	}
})
</script>

<style scoped>
.attribute-group-manager {
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

.attribute-group-list-container {
	flex: 1;
	background: var(--el-bg-color);
	/* 确保容器可以撑满剩余空间 */
	min-height: 0;
}

.attribute-group-scrollbar {
	/* 高度设为100%，自动适应父容器 */
	height: 100%;
}

.attribute-group-scrollbar :deep(.el-scrollbar__view) {
	/* 确保滚动视图高度正确 */
	height: 100%;
}

.attribute-group-item {
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

/* 只有非active状态的项目才应用hover效果 */
.attribute-group-item:hover:not(.active) {
	background: var(--el-fill-color);
	border-color: var(--el-border-color-light);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.attribute-group-item:hover:not(.active)::before {
	opacity: 1;
}

/* active状态的项目保持固定样式 */
.attribute-group-item.active {
	background: linear-gradient(
		135deg,
		var(--el-color-primary-light-9) 0%,
		var(--el-fill-color-blank) 100%
	);
	border: 1px solid var(--el-color-primary-light-3);
	box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.15);
}

.attribute-group-item.active::before {
	opacity: 1;
	background: linear-gradient(
		135deg,
		rgba(var(--el-color-primary-rgb), 0.05) 0%,
		transparent 50%
	);
}

/* active项目的hover效果（可选：可以添加轻微的交互反馈） */
.attribute-group-item.active:hover {
	box-shadow: 0 3px 10px rgba(var(--el-color-primary-rgb), 0.2);
}

/* 增强聚焦状态的可访问性 */
.attribute-group-item:focus-visible {
	outline: 2px solid var(--el-color-primary);
	outline-offset: 2px;
}

/* 禁用状态样式 */
.attribute-group-item:disabled,
.attribute-group-item.disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
	box-shadow: none !important;
}

.attribute-group-item:disabled:hover,
.attribute-group-item.disabled:hover {
	background: var(--el-fill-color-blank);
	border-color: var(--el-border-color-lighter);
	transform: none;
	box-shadow: none;
}

.attribute-group-info {
	flex: 1;
	min-width: 0;
	overflow: hidden;
}

.attribute-group-name {
	font-size: 14px;
	font-weight: 500;
	color: var(--el-text-color-primary);
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.attribute-group-type {
	font-size: 12px;
	color: var(--el-text-color-regular);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.attribute-group-actions {
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
