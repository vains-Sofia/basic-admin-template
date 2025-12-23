<template>
	<div class="design-canvas" @click="handleCanvasClick">
		<div class="canvas-header">
			<h3>预览</h3>
			<div class="canvas-actions">
				<slot name="toolbar" :schema="formSchema"></slot>
			</div>
		</div>

		<div class="canvas-content" ref="containerRef" :style="{ height: `${containerHeight}px` }">
			<!-- Form fields with vuedraggable -->
			<el-form
				ref="formRef"
				:model="formData"
				:label-width="formSchema.formConfig.labelWidth || 120"
				:label-position="formSchema.formConfig.labelPosition || 'right'"
				:size="formSchema.formConfig.size || 'default'"
				class="form-preview"
				:style="{ minHeight: `${containerHeight}px` }"
				@click.self="handleCanvasClick"
				@click.stop
			>
				<el-scrollbar :height="containerHeight" view-style="padding: 10px">
					<!-- 使用 vuedraggable 组件包裹字段列表 -->
					<draggable
						v-model="localFields"
						disabled
						:group="{ name: 'form-designer', pull: true, put: true }"
						:animation="200"
						ghost-class="draggable-ghost"
						chosen-class="draggable-chosen"
						drag-class="draggable-drag"
						item-key="fieldId"
						class="draggable-area"
						:style="{ height: `${containerHeight - 20}px` }"
						:class="{ 'is-empty': formSchema.fields.length === 0 }"
						@change="handleCanvasChange"
						@click.self="handleCanvasClick"
					>
						<template #item="{ element: field }">
							<FieldItem
								:field="field"
								:form-schema="formSchema"
								:selected-field-id="selectedFieldId"
								:expanded="isLayoutExpanded(field.fieldId)"
								@field-click="handleFieldClick"
								@field-delete="handleDeleteField"
								@select-layout="handleSelectLayout"
								@delete-layout="handleDeleteLayout"
								@toggle-layout="handleToggleLayout"
								@children-update="handleChildrenUpdate"
								@field-add="onFieldAdd"
							/>
						</template>

						<!-- Empty state template -->
						<template #footer>
							<div v-if="formSchema.fields.length === 0" class="empty-placeholder">
								<Icon icon="ep:upload" class="empty-icon" />
								<p>Drag components here to start building your form</p>
							</div>
						</template>
					</draggable>
				</el-scrollbar>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
	computed,
	onMounted,
	onUnmounted,
	provide,
	reactive,
	ref,
	watch,
	type WatchStopHandle,
} from 'vue'
import draggable from 'vuedraggable'
import type { FieldDefinition, FormSchema } from '../types.ts'
import FieldItem from './FieldItem.vue'
import { collectAllFields, generateFieldName, generateId } from '../fieldRegistry.ts'
import { getContainerHeight } from '@/utils/Common.ts'
import { useDebounce } from '@/hooks/useDebounce.ts'
import { setupComputeEngine } from '@/components/FormDesigner/src/computeEngine.ts'

const props = defineProps<{
	formSchema: FormSchema
	selectedFieldId: string | undefined
}>()

const emit = defineEmits<{
	fieldClick: [field: FieldDefinition]
	canvasClick: []
	deleteField: [field: FieldDefinition]
	fieldsUpdate: [fields: FieldDefinition[]]
	addField: [fieldType: FieldDefinition, position: number]
	selectLayout: [layoutId: string]
	deleteLayout: [layoutId: string]
	toggleLayout: [layoutId: string]
	updateLayoutChildren: [layoutId: string, children: FieldDefinition[]]
}>()

const formRef = ref()
const formData = reactive<Record<string, any>>({})

provide('formData', formData)

let watchHandles: WatchStopHandle[] = []
watch(
	props.formSchema,
	useDebounce(() => {
		const allFields = collectAllFields(props.formSchema.fields)
		allFields.forEach((field) => {
			formData[field.fieldName] = field.defaultValue
		})
		watchHandles.forEach((stop) => stop())
		watchHandles = setupComputeEngine(allFields, formData)
	}, 1000),
	{ immediate: true, deep: true },
)

const containerRef = ref<HTMLDivElement>()

const containerHeight = ref()
const initContainerHeight = useDebounce(() => {
	containerHeight.value = getContainerHeight(containerRef)
})

onMounted(() => {
	containerHeight.value = getContainerHeight(containerRef)
	window.addEventListener('resize', initContainerHeight)
})

onUnmounted(() => {
	window.removeEventListener('resize', initContainerHeight)
})

// 展开的布局容器集合
const expandedLayouts = ref<Set<string>>(new Set())

// 本地字段列表，用于 v-model 绑定
const localFields = computed({
	get: () => props.formSchema.fields,
	set: (value) => {
		// 当字段顺序变化时，通知父组件
		emit('fieldsUpdate', value)
	},
})

function handleCanvasClick() {
	emit('canvasClick')
}

// 处理画布内字段重排序
function handleCanvasChange(evt: any) {
	if (evt.added) {
		const { added } = evt
		if (added.element) {
			const fieldType = added.element as FieldDefinition
			fieldType.fieldId = generateId()

			fieldType.fieldName = generateFieldName(props.formSchema.fields, fieldType.type)
			if (fieldType.type === 'layout' && fieldType.children) {
				fieldType.children.forEach(
					(child: FieldDefinition) => (child.fieldId = generateId()),
				)
			}
			emit('addField', fieldType, added.newIndex)
			// emit('fieldClick', fieldType)
		}
	}
	// vuedraggable 已经更新了 localFields（通过 v-model）
}

function handleFieldClick(field: FieldDefinition) {
	emit('fieldClick', field)
}

function handleDeleteField(field: FieldDefinition) {
	emit('deleteField', field)
}

// 处理选择布局
function handleSelectLayout(layoutId: string) {
	emit('selectLayout', layoutId)
}

// 处理删除布局
function handleDeleteLayout(layoutId: string) {
	emit('deleteLayout', layoutId)
}

// 处理切换布局展开/折叠
function handleToggleLayout(layoutId: string) {
	if (expandedLayouts.value.has(layoutId)) {
		expandedLayouts.value.delete(layoutId)
	} else {
		expandedLayouts.value.add(layoutId)
	}
	emit('toggleLayout', layoutId)
}

function onFieldAdd(field: FieldDefinition) {
	emit('addField', field, 0)
}

// 处理布局子字段更新
function handleChildrenUpdate(layoutId: string, children: FieldDefinition[]) {
	emit('updateLayoutChildren', layoutId, children)
}

// // 处理嵌套字段点击
// function handleNestedFieldClick(field: FieldDefinition) {
// 	emit('fieldClick', field)
// }
//
// // 处理嵌套字段删除
// function handleNestedFieldDelete(field: FieldDefinition) {
// 	emit('deleteField', field)
// }

// 检查布局是否展开
function isLayoutExpanded(layoutId: string): boolean {
	return expandedLayouts.value.has(layoutId)
}
</script>

<style scoped lang="scss">
.design-canvas {
	display: flex;
	flex-direction: column;
	background: var(--el-bg-color);

	.canvas-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		background: var(--el-bg-color);
		border-bottom: 1px solid var(--el-border-color);

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 600;
			color: var(--el-text-color-primary);
		}

		.canvas-actions {
			display: flex;
			gap: 8px;
		}
	}

	.canvas-content {
		flex: 1;
		height: 100%;
		position: relative;
	}

	.draggable-area {
		position: relative;

		&.is-empty {
			height: 100%;
		}
	}

	.empty-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		border: 2px dashed var(--el-border-color);
		border-radius: 8px;
		background: var(--el-bg-color);

		.empty-icon {
			font-size: 64px;
			color: var(--el-text-color-secondary);
			margin-bottom: 16px;
		}

		p {
			color: var(--el-text-color-secondary);
			font-size: 14px;
			margin: 0;
		}
	}

	.form-preview {
		background: var(--el-bg-color);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	// vuedraggable 项目包装器
	.field-item-wrapper {
		width: 100%;
	}

	// vuedraggable 拖拽样式类
	:deep(.draggable-ghost) {
		opacity: 0.5;
		border: 2px dashed var(--el-color-primary);
		background: var(--el-color-primary-light-9);
		border-radius: 4px;
	}

	:deep(.draggable-chosen) {
		border-color: var(--el-color-primary);
		box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
	}

	:deep(.draggable-drag) {
		opacity: 0.7;
		transform: rotate(2deg);
		cursor: grabbing;
	}
}

// Special handling for select/radio/checkbox options
:deep(.el-select) {
	width: 100%;
}

//:deep(.el-radio-group),
//:deep(.el-checkbox-group) {
//	display: flex;
//	flex-direction: column;
//	gap: 8px;
//}
</style>
