<template>
	<div class="design-canvas" @click="handleCanvasClick">
		<div class="canvas-header">
			<h3>预览</h3>
			<div class="canvas-actions">
				<slot name="toolbar" :schema="formSchema"></slot>
			</div>
		</div>

		<div class="canvas-content" ref="containerRef" :style="{ height: `${containerHeight}px` }">
			<!-- 表单拖拽面板 -->
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
								@field-click="handleFieldClick"
								@field-delete="handleDeleteField"
								@select-layout="handleSelectLayout"
								@delete-layout="handleDeleteLayout"
								@children-update="handleChildrenUpdate"
								@field-add="onFieldAdd"
							/>
						</template>

						<!-- 空状态提示 -->
						<template #footer>
							<div v-if="formSchema.fields.length === 0" class="empty-placeholder">
								<Icon icon="ep:upload" class="empty-icon" />
								<p>将组件拖到此处即可开始构建表单</p>
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
import { setupComputeEngine } from '../computeEngine.ts'

const props = defineProps<{
	formSchema: FormSchema
	selectedFieldId: string | undefined
}>()

const emit = defineEmits<{
	fieldClick: [field: FieldDefinition]
	canvasClick: []
	deleteField: [field: FieldDefinition]
	fieldsUpdate: [fields: FieldDefinition[]]
	addField: [fieldType: FieldDefinition]
	selectLayout: [layoutId: string]
	deleteLayout: [layoutId: string]
	toggleLayout: [layoutId: string]
	updateLayoutChildren: [layoutId: string, children: FieldDefinition[]]
}>()

// 表单实例
const formRef = ref()
// 表单双向绑定data
const formData = reactive<Record<string, any>>({})

// 给子组件传递表单数据
provide('formData', formData)

let watchHandles: WatchStopHandle[] = []

// 监听表单项的变化，动态执行表达式
watch(
	props.formSchema,
	useDebounce(() => {
		// 提取所有字段(布局中可能有，递归获取)
		const allFields = collectAllFields(props.formSchema.fields)
		// 设置默认值
		allFields.forEach((field) => {
			formData[field.fieldName] = field.defaultValue
		})
		// 停止之前的监听
		watchHandles.forEach((stop) => stop())
		// 解析表达式并执行，同时添加监听，属性值改变后执行表达式
		watchHandles = setupComputeEngine(allFields, formData)
	}, 1000),
	{ immediate: true, deep: true },
)

// 容器实例
const containerRef = ref<HTMLDivElement>()

// 计算容器高度，防抖
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

// 本地字段列表，用于 v-model 绑定
const localFields = computed({
	get: () => props.formSchema.fields,
	set: (value) => {
		// 当字段顺序变化时，通知父组件
		emit('fieldsUpdate', value)
	},
})

// 点击预览面板
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
			emit('addField', fieldType)
			// emit('fieldClick', fieldType)
		}
	}
}

// 点击表单项事件
function handleFieldClick(field: FieldDefinition) {
	emit('fieldClick', field)
}

// 删除表单项事件
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

// 添加字段
function onFieldAdd(field: FieldDefinition) {
	emit('addField', field)
}

// 处理布局子字段更新
function handleChildrenUpdate(layoutId: string, children: FieldDefinition[]) {
	emit('updateLayoutChildren', layoutId, children)
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
