<template>
	<div class="property-panel">
		<div class="panel-header">
			<h3>属性配置</h3>
		</div>

		<div class="panel-content" ref="containerRef">
			<el-scrollbar :height="containerHeight - 32" wrap-style="margin-right: 10px;">
				<!-- Form Properties -->
				<div v-if="properties" class="property-section">
					<div class="section-title">
						{{
							selectedField
								? selectedField.type === 'layout'
									? '布局设置'
									: '字段设置'
								: '表单设置'
						}}
					</div>
					<div class="field-type-indicator">
						<Icon :icon="fieldTypeIcon" />
						<span>{{ fieldTypeLabel }}</span>
					</div>

					<el-form :model="properties" label-position="top">
						<!-- 实际配置项 -->
						<PropertyPanelContent
							:form-schema="formSchema"
							:selected-field="selectedField"
							:property-schema="propertySchema"
							:form-properties="formProperties"
							@update-form-property="handleUpdateFormProperty"
							@update-field-property="handleUpdateFieldProperty"
						/>
					</el-form>
				</div>

				<!-- 未选择时提示 -->
				<div v-else class="no-selection">
					<Icon icon="ep:info-filled" class="info-icon" />
					<p>选择一个字段或点击画布即可编辑属性</p>
				</div>
			</el-scrollbar>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useDebounce } from '@/hooks/useDebounce.ts'
import { getContainerHeight } from '@/utils/Common.ts'
import { getFieldTypeConfig } from '../fieldRegistry.ts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import PropertyPanelContent from './PropertyPanelContent.vue'
import type { FieldDefinition, FormSchema, PropertySchema } from '../types.ts'

const props = defineProps<{
	formSchema: FormSchema
	selectedField?: FieldDefinition
	editTarget: 'form' | 'field' | 'layout' | null
}>()

const emit = defineEmits<{
	updateFormProperty: [key: string, value: any]
	updateFieldProperty: [fieldId: string, key: string, value: any]
}>()

// 如果未选择特定字段属性，则使用表单属性
const properties = computed(() => props.selectedField ?? formProperties.value)

// 表单属性
const formProperties = computed(() => {
	return {
		formName: props.formSchema.formName,
		labelWidth: (props.formSchema.formConfig.labelWidth as number) || 120,
		labelPosition: props.formSchema.formConfig.labelPosition || 'right',
		size: props.formSchema.formConfig.size || 'default',
		fieldPadding: props.formSchema.formConfig.fieldPadding,
	}
})

// 获取所选字段类型的属性配置项
const propertySchema = computed<PropertySchema[]>(() => {
	if (!properties.value) return []

	const config = getFieldTypeConfig(props.selectedField)
	return config || []
})

// 获取表单项的图标
const fieldTypeIcon = computed(() => {
	if (!props.selectedField) return 'ri:file-list-line'
	return props.selectedField.icon
})

// 表单项Label
const fieldTypeLabel = computed(() => {
	if (props.selectedField) {
		return props.selectedField.label || props.selectedField.type
	}
	return formProperties.value.formName || '表单'
})

/**
 * 表单属性修改事件
 * @param key 表单配置属性
 * @param value 修改后的值
 */
function handleUpdateFormProperty(key: string, value: any) {
	emit('updateFormProperty', key, value)
}

/**
 * 表单项属性修改事件
 * @param fieldId 表单项唯一id
 * @param key 表单项配置属性
 * @param value 修改后的值
 */
function handleUpdateFieldProperty(fieldId: string, key: string, value: any) {
	emit('updateFieldProperty', fieldId, key, value)
}

// 容器实例
const containerRef = ref<HTMLDivElement>()
// 容器高度
const containerHeight = ref()
// 动态计算容器高度，防抖
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
</script>

<style scoped lang="scss">
.property-panel {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
	background: var(--el-bg-color);
	border-left: 1px solid var(--el-border-color);

	.panel-header {
		padding: 16px;
		border-bottom: 1px solid var(--el-border-color);

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 600;
			color: var(--el-text-color-primary);
		}
	}

	.panel-content {
		flex: 1;
		min-height: 0;
		padding: 16px;
		overflow: hidden;
	}

	.property-section {
		.section-title {
			font-size: 14px;
			font-weight: 600;
			color: var(--el-text-color-secondary);
			margin-bottom: 16px;
			padding-bottom: 8px;
			border-bottom: 1px solid var(--el-border-color);
		}

		.field-type-indicator {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 8px 12px;
			border: 1px solid var(--el-border-color);
			border-radius: 6px;
			margin-bottom: 16px;

			svg {
				font-size: 18px;
				color: var(--el-color-primary);
			}

			span {
				font-size: 13px;
				font-weight: 500;
				color: var(--el-text-color-secondary);
			}
		}
	}

	.no-selection {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		text-align: center;

		.info-icon {
			font-size: 48px;
			color: var(--el-bg-color);
			margin-bottom: 12px;
		}

		p {
			color: var(--el-text-color-secondary);
			font-size: 14px;
			margin: 0;
		}
	}
}
:global(html),
:global(body) {
	overflow: hidden;
}
</style>
