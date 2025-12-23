<template>
	<div class="form-designer">
		<!-- Left Panel: Component Library -->
		<div class="designer-left-panel">
			<ComponentLibrary>
				<template #library-footer>
					<slot name="library-footer"></slot>
				</template>
			</ComponentLibrary>
		</div>

		<!-- Center Panel: Design Canvas -->
		<div class="designer-center-panel">
			<DesignCanvas
				:form-schema="formSchema"
				:selected-field-id="selectedFieldId"
				@field-click="handleFieldClick"
				@canvas-click="handleCanvasClick"
				@delete-field="handleDeleteField"
				@fields-update="handleFieldsUpdate"
				@add-field="handleAddField"
				@select-layout="handleSelectLayout"
				@delete-layout="handleDeleteLayout"
				@toggle-layout="handleToggleLayout"
				@update-layout-children="handleUpdateLayoutChildren"
			>
				<template #toolbar="{ schema }">
					<slot name="toolbar" :schema="schema">
						<el-button type="primary" link size="small" @click="viewFormVisible = true">
							<Icon icon="ri:file-list-line" style="margin-right: 4px" />
							表单预览
						</el-button>
						<el-button type="primary" link size="small" @click="viewJsonVisible = true">
							<Icon icon="ep:view" style="margin-right: 4px" />
							查看JSON
						</el-button>
<!--						<el-button type="primary" link size="small" @click="handleExportSchema">
							<Icon icon="ep:copy-document" style="margin-right: 4px" />
							复制JSON
						</el-button>-->
						<el-button
							type="primary"
							link
							size="small"
							@click="downloadSchema(JSON.stringify(formSchema, null, 2).replace(/\\/g, '\\\\'))"
						>
							<Icon icon="ep:download" style="margin-right: 4px" />
							下载JSON
						</el-button>
						<el-button type="danger" size="small" link @click="handleClearForm">
							<Icon icon="ep:delete" style="margin-right: 4px" />
							清空
						</el-button>
					</slot>
				</template>
			</DesignCanvas>
		</div>

		<!-- Right Panel: Property Panel -->
		<div class="designer-right-panel">
			<PropertyPanel
				:form-schema="formSchema"
				:selected-field="selectedField"
				:edit-target="editTarget"
				@update-form-property="handleUpdateFormProperty"
				@update-field-property="handleUpdateFieldProperty"
			/>
		</div>

		<!-- 模态框 -->
		<el-dialog v-model="viewFormVisible" title="预览表单" top="8vh" width="65vw">
			<el-scrollbar height="70vh" wrap-style="margin-right: 10px;">
				<FormViewer
					v-if="viewFormVisible"
					:form-json="JSON.stringify(formSchema)"
					ref="formRef"
				/>
			</el-scrollbar>
			<template #footer>
				<el-button plain @click="() => formRef?.reset?.()"> 重置表单 </el-button>
				<el-button plain @click="() => formRef?.validate?.()"> 验证表单 </el-button>
				<el-button plain @click="() => formRef?.clearAllValidate?.()"> 清除验证 </el-button>
				<el-button plain @click="viewFormData"> 查看数据 </el-button>
				<el-button plain @click="viewFormVisible = false"> 关闭 </el-button>
			</template>
		</el-dialog>
		<el-dialog title="查看JSON" top="8vh" v-model="viewJsonVisible">
			<CodeViewer v-if="viewJsonVisible" :code="JSON.stringify(formSchema, null, 2)" />
			<template #footer>
				<el-button plain @click="handleExportSchema"> 复制JSON </el-button>
				<el-button plain @click="downloadSchema(JSON.stringify(formSchema, null, 2).replace(/\\/g, '\\\\'))">
					下载JSON
				</el-button>
				<el-button plain @click="viewJsonVisible = false"> 关闭 </el-button>
			</template>
		</el-dialog>
		<el-dialog title="查看表单数据" top="8vh" v-model="viewFormDataVisible">
			<CodeViewer
				v-if="viewFormDataVisible"
				:code="JSON.stringify(formRef?.getData(), null, 2)"
			/>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import ComponentLibrary from './ComponentLibrary.vue'
import DesignCanvas from './DesignCanvas.vue'
import PropertyPanel from './PropertyPanel.vue'
import type { FieldDefinition, FormSchema } from '../types.ts'
import CodeViewer from '@/components/CodeViewer'
import FormViewer from '../viewer/FormViewer.vue'
import { generateFieldName, generateId } from '../fieldRegistry.ts'
import { ElButton } from 'element-plus'

const emit = defineEmits<{
	'update:schema': [schema: FormSchema]
	save: [schema: FormSchema]
	cancel: []
}>()

const props = withDefaults(
	defineProps<{
		initialSchema?: FormSchema | null
		readonly?: boolean
	}>(),
	{
		initialSchema: null,
		readonly: false,
	},
)

// 表单预览器实例
const formRef = ref<InstanceType<typeof FormViewer>>()
// 预览表单模态框显示状态
const viewFormVisible = ref(false)
// 预览JSON模态框显示状态
const viewJsonVisible = ref(false)
// 预览表单数据模态框显示状态
const viewFormDataVisible = ref(false)

const viewFormData = () => {
	const formData = JSON.stringify(formRef?.value?.getData(), null, 2)
	if (!formData || formData === '{}') {
		ElMessage.info('无数据')
		return
	}
	viewFormDataVisible.value = true
}

// Form schema state
const formSchema = ref<FormSchema>({
	formId: generateId(),
	formName: '表单',
	formConfig: {
		labelWidth: 120,
		labelPosition: 'right',
		size: 'default',
		fieldPadding: 5,
	},
	fields: [],
})

// Selection state
const selectedFieldId = ref<string>()
const editTarget = ref<'form' | 'field' | 'layout' | null>('form')

// 布局状态
const expandedLayouts = ref<Set<string>>(new Set())

// Computed selected field
const selectedField = computed<FieldDefinition | undefined>(() =>
	selectedFieldId.value ? findFieldById(selectedFieldId.value) : undefined,
)

// 辅助函数：递归查找字段
function findFieldById(id: string, fields = formSchema.value.fields): FieldDefinition | undefined {
	for (const field of fields) {
		if (field.fieldId === id) {
			return field
		}
		// 如果是布局，在 children 中查找
		if (field.children && field.children.length > 0) {
			const found = findFieldById(id, field.children ?? [])
			if (found) {
				return found
			}
		}
	}
	return undefined
}

// 辅助函数：递归更新字段
function updateFieldById(
	id: string,
	updates: Partial<FieldDefinition>,
	fields = formSchema.value.fields,
): boolean {
	for (let i = 0; i < fields.length; i++) {
		if (fields[i].fieldId === id) {
			fields[i] = { ...fields[i], ...updates }
			return true
		}
		// 如果是布局，在 children 中查找
		const len = fields[i]?.children?.length ?? 0
		if (fields[i].children && len > 0) {
			const children = fields[i].children ?? []
			if (updateFieldById(id, updates, children ?? [])) {
				return true
			}
		}
	}
	return false
}

// 辅助函数：递归删除字段
function removeFieldById(
	id: string,
	fields = formSchema.value.fields,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parent: FieldDefinition | null = null,
): boolean {
	for (let i = 0; i < fields.length; i++) {
		if (fields[i].fieldId === id) {
			fields.splice(i, 1)
			return true
		}
		// 如果是布局，在 children 中查找
		const len = fields[i]?.children?.length ?? 0
		if (fields[i].children && len > 0) {
			const children = fields[i].children ?? []
			if (removeFieldById(id, children ?? [], fields[i])) {
				return true
			}
		}
	}
	return false
}

// Initialize from prop
watch(
	() => props.initialSchema,
	(schema) => {
		if (schema) {
			formSchema.value = JSON.parse(JSON.stringify(schema))
		}
	},
	{ immediate: true, deep: true },
)

// Emit schema changes
watch(
	formSchema,
	(schema) => {
		emit('update:schema', JSON.parse(JSON.stringify(schema)))
	},
	{ deep: true },
)

// 处理字段列表更新（重排序）
function handleFieldsUpdate(fields: FieldDefinition[]) {
	formSchema.value.fields = fields
}

// 处理添加新字段
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleAddField(fieldTypeConfig: FieldDefinition, position: number) {
	if (props.readonly) return

	// 选中新添加的字段
	selectedFieldId.value = fieldTypeConfig.fieldId
	editTarget.value = fieldTypeConfig.layoutType ? 'layout' : 'field'

	ElMessage.success('Field added successfully')
}

// 处理选择布局
function handleSelectLayout(layoutId: string) {
	selectedFieldId.value = layoutId
	editTarget.value = 'layout'
}

// 处理删除布局
function handleDeleteLayout(layoutId: string) {
	if (props.readonly) return

	const layout = findFieldById(layoutId)
	if (!layout) return

	const childCount = countChildren(layout) || 0
	const message =
		childCount > 0
			? `删除布局将同时删除内部所有字段（${childCount} 个），确认删除？`
			: `确认删除该布局？`

	ElMessageBox.confirm(message, '确认删除', {
		confirmButtonText: '删除',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			// 删除布局
			removeFieldById(layoutId)

			// 清除选中状态
			if (selectedFieldId.value === layoutId) {
				selectedFieldId.value = undefined
				editTarget.value = 'form'
			}

			// 清除展开状态
			expandedLayouts.value.delete(layoutId)

			ElMessage.success('布局删除成功')
		})
		.catch(() => {
			// User cancelled
		})
}

function countChildren(field: FieldDefinition): number {
	if (!field.children || field.children.length === 0) {
		return 0
	}

	let count = 0

	for (const column of field.children) {
		for (const child of column.children ?? []) {
			count += 1
			count += countChildren(child)
		}
	}

	return count
}

// 处理切换布局展开/折叠
function handleToggleLayout(layoutId: string) {
	if (expandedLayouts.value.has(layoutId)) {
		expandedLayouts.value.delete(layoutId)
	} else {
		expandedLayouts.value.add(layoutId)
	}
}

// 处理布局子字段更新
function handleUpdateLayoutChildren(layoutId: string, children: FieldDefinition[]) {
	if (props.readonly || !children) return

	// 更新布局的 children 属性
	updateFieldById(layoutId, { children })

	// 更新所有子字段的 parentId
	children.forEach((childList) => {
		if (childList) {
			for (const child of childList.children ?? []) {
				if (!child.parentId || child.parentId !== layoutId) {
					updateFieldById(child.fieldId, { parentId: layoutId })
				}
			}
		}
	})
}

// Field click handler
function handleFieldClick(field: FieldDefinition) {
	field.fieldName = field.fieldName ?? generateFieldName(formSchema.value.fields, field.type)

	selectedFieldId.value = field.fieldId
	// 检查是否为布局类型
	editTarget.value = field.layoutType ? 'layout' : 'field'
}

// Canvas click handler
function handleCanvasClick() {
	selectedFieldId.value = undefined
	editTarget.value = 'form'
}

// Delete field handler
function handleDeleteField(field: FieldDefinition) {
	if (props.readonly) return

	// 判断是否为布局
	if (field.layoutType) {
		handleDeleteLayout(field.fieldId)
		return
	}

	ElMessageBox.confirm(`Are you sure to delete field "${field.label}"?`, 'Confirm Delete', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	})
		.then(() => {
			removeFieldById(field.fieldId)

			// Clear selection if deleted field was selected
			if (selectedFieldId.value === field.fieldId) {
				selectedFieldId.value = undefined
				editTarget.value = 'form'
			}

			ElMessage.success('Field deleted successfully')
		})
		.catch(() => {
			// User cancelled
		})
}

// Update form property
function handleUpdateFormProperty(key: string, value: any) {
	if (props.readonly) return

	if (key === 'formName') {
		formSchema.value.formName = value
	} else {
		const configKey = key as keyof typeof formSchema.value.formConfig
		;(formSchema.value.formConfig as any)[configKey] = value
	}
}

// Update field property
function handleUpdateFieldProperty(fieldId: string, key: string, value: any) {
	if (props.readonly) return

	const field = findFieldById(fieldId)

	if (!field) return
	if (key === 'layoutProps.columns') {
		// 特殊处理布局列，添加时添加默认列，移除时去除最后一个
		if (value > (field.children?.length ?? 0)) {
			field.children?.push({
				fieldId: `${generateId()}`,
				type: 'layout',
				icon: 'ep:menu',
				label: 'Col',
				labelCn: '列布局',
				fieldName: 'gridLayout',
				category: 'layout',
				layoutType: 'col',
				validationRules: [],
				componentProps: {
					span: 12,
				},
				layoutProps: {},
				children: [],
			})
		} else if (value < (field.children?.length ?? 0)) {
			const len = field.children?.length ?? 0
			const colLen = field.children?.[len - 1].children?.length ?? 0
			if (colLen > 0) {
				ElMessageBox.confirm('是否确认减少列？该操作会移除最后一列内所有组件', '确认删除', {
					confirmButtonText: '确认',
					cancelButtonText: '取消',
					type: 'warning',
				})
					.then(() => {
						// 删除布局容器最后一列
						if (field.children) {
							field.children.splice(len - 1, 1)
						}
					})
					.catch(() => {
						// User cancelled
						value++
					})
			} else {
				// 删除布局容器最后一列
				if (field.children) {
					field.children.splice(len - 1, 1)
				}
			}
		}
	}

	const keys = key.split('.')
	let target: any = field

	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i]
		if (!target[k] || typeof target[k] !== 'object') {
			target[k] = {}
		}
		target = target[k]
	}

	target[keys[keys.length - 1]] = value
	// console.log(fieldId, key, value)
}

// Export schema
function handleExportSchema() {
	const schemaJson = JSON.stringify(formSchema.value, null, 2).replace(/\\/g, '\\\\')

	// Copy to clipboard
	navigator.clipboard
		.writeText(schemaJson)
		.then(() => {
			ElMessage.success('Schema copied to clipboard!')
		})
		.catch(() => {
			// Fallback: download as file
			downloadSchema(schemaJson)
		})

	emit('save', formSchema.value)
}

// Download schema as JSON file
function downloadSchema(schemaJson: string) {
	const blob = new Blob([schemaJson], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${formSchema.value.formName || 'form-schema'}.json`
	link.click()
	URL.revokeObjectURL(url)

	ElMessage.success('Schema downloaded!')
}

// Clear form
function handleClearForm() {
	if (props.readonly) return

	ElMessageBox.confirm('Are you sure to clear all fields?', 'Confirm Clear', {
		confirmButtonText: 'Clear',
		cancelButtonText: 'Cancel',
		type: 'warning',
	})
		.then(() => {
			formSchema.value.fields = []
			selectedFieldId.value = undefined
			editTarget.value = 'form'
			ElMessage.success('Form cleared')
		})
		.catch(() => {
			// User cancelled
		})
}

// Expose methods for parent component
defineExpose({
	getSchema: () => formSchema.value,
	setSchema: (schema: FormSchema) => {
		formSchema.value = JSON.parse(JSON.stringify(schema))
	},
	clearForm: () => {
		formSchema.value.fields = []
		selectedFieldId.value = undefined
		editTarget.value = 'form'
	},
})
</script>

<style scoped lang="scss">
.form-designer {
	display: grid;
	grid-template-columns: 300px 1fr 320px;
	background: var(--el-bg-color);
	overflow: hidden;

	.designer-left-panel {
		overflow: hidden;
	}

	.designer-center-panel {
		overflow: hidden;
		border-left: 1px solid var(--el-border-color);
		border-right: 1px solid var(--el-border-color);
	}

	.designer-right-panel {
		overflow: hidden;
	}
}

// Responsive design
@media (max-width: 1200px) {
	.form-designer {
		grid-template-columns: 240px 1fr 280px;
	}
}

@media (max-width: 768px) {
	.form-designer {
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto;

		.designer-left-panel,
		.designer-right-panel {
			max-height: 300px;
		}
	}
}
</style>
