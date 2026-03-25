<template>
	<div class="dict-type-manager">
		<!-- 操作栏 -->
		<div ref="operationBar" class="operation-bar">
			<el-input
				v-model="searchKeyword"
				v-debounce:input="{ handler: handleSearch, wait: 400 }"
				placeholder="搜索字典类型"
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

		<!-- 字典类型列表 -->
		<div class="dict-list-container">
			<el-scrollbar ref="dictScrollbar" class="dict-scrollbar">
				<div class="dict-list">
					<div
						v-for="item in dictTypeList"
						:key="item.id"
						class="dict-item"
						:class="{ active: selectedId === item.id }"
						@click="selectDictType(item)"
					>
						<div class="dict-info">
							<div class="dict-name">{{ item.name }}</div>
							<div class="dict-code">{{ item.typeCode }}</div>
						</div>
						<div class="dict-actions">
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
					<div v-if="noMore && dictTypeList.length > 0" class="no-more">
						没有更多数据了
					</div>

					<!-- 空数据 -->
					<el-empty v-if="dictTypeList.length === 0 && !loading" description="暂无数据" />
				</div>
			</el-scrollbar>
		</div>

		<!-- 新增/编辑弹窗 -->
		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
			<el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
				<el-form-item label="类型名称" prop="name">
					<el-input v-model="form.name" placeholder="请输入字典类型名称" />
				</el-form-item>
				<el-form-item label="类型编码" prop="typeCode">
					<el-input v-model="form.typeCode" placeholder="请输入字典类型编码" />
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input
						v-model="form.description"
						type="textarea"
						placeholder="请输入描述"
						:rows="3"
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
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import type { ScrollbarInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useDebounce } from '@/hooks/useDebounce.ts'
import { createType, deleteType, pageType, updateType } from '@/api/system/Dict'
import type { FindSysDictTypeResponse } from '@/api/types/DictTypes.ts'

// 响应式数据
const pageSize = ref(15)
const noMore = ref(false)
const currentPage = ref(1)
const loading = ref(false)
const dictTypeList = ref<FindSysDictTypeResponse[]>([])
const selectedId = ref<string>()
const searchKeyword = ref('')

// 滚动列表
const dictScrollbar = ref<ScrollbarInstance>()
// 操作栏
const operationBar = ref()

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典类型')
const formRef = ref<InstanceType<any>>(null)
const form = reactive({
	id: '',
	name: '',
	typeCode: '',
	description: '',
})

// 表单验证规则
const rules = {
	name: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
	typeCode: [
		{ required: true, message: '请输入字典类型编码', trigger: 'blur' },
		{
			pattern: /^[a-zA-Z0-9_]+$/,
			message: '编码只能包含字母、数字和下划线',
			trigger: 'blur',
		},
	],
}

// 自适应调整滚动列表高度
const handleDictScrollbarResize = useDebounce(() => {
	const wrapRef = dictScrollbar.value?.wrapRef
	if (wrapRef && wrapRef.style) {
		wrapRef.style.height = `${window.innerHeight - operationBar.value?.getBoundingClientRect().top - 101}px`
	}
}, 60)

// 事件定义
const emit = defineEmits(['select', 'add', 'edit', 'delete', 'refresh'])

// 分页查询
const fetchDictTypes = async (current = 1, size = 12, keyword = '') => {
	return pageType({ current, size, keyword })
}

// 加载字典类型列表
const loadDictTypes = async (reset = false) => {
	if (loading.value) return

	loading.value = true

	try {
		if (reset) {
			currentPage.value = 1
			noMore.value = false
		}

		const result = await fetchDictTypes(currentPage.value, pageSize.value, searchKeyword.value)

		if (reset) {
			dictTypeList.value = result.records
		} else {
			dictTypeList.value.push(...result.records)
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

// 搜索处理
const handleSearch = () => {
	loadDictTypes(true)
}

// 选择字典类型
const selectDictType = (item: FindSysDictTypeResponse) => {
	selectedId.value = item.id
	emit('select', item)
}

// 新增字典类型
const handleAdd = () => {
	dialogTitle.value = '新增字典类型'
	resetForm()
	dialogVisible.value = true
}

// 编辑字典类型
const handleEdit = (item: FindSysDictTypeResponse) => {
	dialogTitle.value = '编辑字典类型'
	form.id = item.id
	form.name = item.name
	form.typeCode = item.typeCode
	form.description = item.description
	dialogVisible.value = true
}

// 删除字典类型
const handleDelete = (item: FindSysDictTypeResponse) => {
	ElMessageBox.confirm(
		`确定要删除字典类型"${item.name}"吗？<br />注意：关联的字典项也会被删除！`,
		'删除确认',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			dangerouslyUseHTMLString: true,
			type: 'warning',
		},
	)
		.then(() => {
			deleteType(item.id).then(() => {
				const index = dictTypeList.value.findIndex((dict) => dict.id === item.id)
				if (index > -1) {
					dictTypeList.value.splice(index, 1)
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
				updateType(form.id, form).then((res) => {
					// 编辑操作
					const index = dictTypeList.value.findIndex((item) => item.id === res.id)
					if (index > -1) {
						dictTypeList.value[index] = { ...res }
					}
					ElMessage.success('编辑成功')
					emit('edit', { ...form })
					dialogVisible.value = false
					resetForm()
				})
			} else {
				// 新增操作
				createType(form).then((res) => {
					const newItem = { ...res }
					dictTypeList.value.unshift(newItem)
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
	form.id = ''
	form.name = ''
	form.typeCode = ''
	form.description = ''
	nextTick(() => {
		formRef.value?.clearValidate()
	})
}

// 初始化
onMounted(() => {
	handleDictScrollbarResize()
	window.addEventListener('resize', handleDictScrollbarResize)
	loadDictTypes(true)
})

// 取消挂载之前
onUnmounted(() => {
	window.removeEventListener('resize', handleDictScrollbarResize)
})

const loadTrigger = ref<HTMLElement | null>(null)

// 加载更多
useIntersectionObserver(loadTrigger, ([{ isIntersecting }]) => {
	if (isIntersecting && !loading.value && !noMore.value) {
		loadDictTypes()
	}
})
</script>

<style scoped>
.dict-type-manager {
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

.dict-list-container {
	flex: 1;
	background: var(--el-bg-color);
	/* 确保容器可以撑满剩余空间 */
	min-height: 0;
}

.dict-scrollbar {
	/* 高度设为100%，自动适应父容器 */
	height: 100%;
}

.dict-scrollbar :deep(.el-scrollbar__view) {
	/* 确保滚动视图高度正确 */
	height: 100%;
}

.dict-list {
	padding: 15px;
	/* 移除之前可能的高度限制 */
}

.dict-item {
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
.dict-item:hover:not(.active) {
	background: var(--el-fill-color);
	border-color: var(--el-border-color-light);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dict-item:hover:not(.active)::before {
	opacity: 1;
}

/* active状态的项目保持固定样式 */
.dict-item.active {
	background: linear-gradient(
		135deg,
		var(--el-color-primary-light-9) 0%,
		var(--el-fill-color-blank) 100%
	);
	border: 1px solid var(--el-color-primary-light-3);
	box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.15);
}

.dict-item.active::before {
	opacity: 1;
	background: linear-gradient(
		135deg,
		rgba(var(--el-color-primary-rgb), 0.05) 0%,
		transparent 50%
	);
}

/* active项目的hover效果（可选：可以添加轻微的交互反馈） */
.dict-item.active:hover {
	box-shadow: 0 3px 10px rgba(var(--el-color-primary-rgb), 0.2);
}

/* 增强聚焦状态的可访问性 */
.dict-item:focus-visible {
	outline: 2px solid var(--el-color-primary);
	outline-offset: 2px;
}

/* 禁用状态样式 */
.dict-item:disabled,
.dict-item.disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none !important;
	box-shadow: none !important;
}

.dict-item:disabled:hover,
.dict-item.disabled:hover {
	background: var(--el-fill-color-blank);
	border-color: var(--el-border-color-lighter);
	transform: none;
	box-shadow: none;
}

.dict-info {
	flex: 1;
}

.dict-name {
	font-size: 14px;
	font-weight: 500;
	color: var(--el-text-color-primary);
	margin-bottom: 4px;
}

.dict-code {
	font-size: 12px;
	color: var(--el-text-color-regular);
}

.dict-actions {
	display: flex;
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
