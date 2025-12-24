<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, inject } from 'vue'
import { getFieldComponent } from '../fieldRegistry.ts'
import { buildElFormRules } from '../ValidatorRegistry.ts'
import type { FieldDefinition, FormSchema } from '@/components/FormDesigner'

const props = defineProps<{
	field: FieldDefinition
	selected: boolean
	formSchema: FormSchema
}>()

const emit = defineEmits<{
	fieldClick: [field: FieldDefinition]
	fieldDelete: [field: FieldDefinition]
}>()

// formData 从父级 provide
const formData = inject<Record<string, any>>('formData')!

// 表单项点击事件
function handleFieldClick(field: FieldDefinition) {
	emit('fieldClick', field)
}

// 表单项删除事件
function handleDeleteField(field: FieldDefinition) {
	emit('fieldDelete', field)
}

const rules = computed(() => buildElFormRules(props.field.validationRules, formData))
</script>

<template>
	<div
		class="field-wrapper"
		:class="{
			selected: selected,
		}"
		@click.stop="handleFieldClick(field)"
	>
		<!-- Field content -->
		<div class="field-content" :style="{ padding: `${formSchema.formConfig.fieldPadding}px` }">
			<el-form-item
				:label="field.label"
				:prop="field.fieldName"
				:label-width="field.labelWidth"
				:rules="rules"
			>
				<!-- Render different field types -->
				<!-- Select with options -->
				<el-select
					v-if="field.type === 'select'"
					v-model="formData[field.fieldName as string]"
					v-bind="field.componentProps"
				>
					<el-option
						v-for="option in field.componentProps?.options || []"
						:key="option.value"
						:label="option.label"
						:value="option.value"
						:disabled="field.componentProps?.readonly"
					/>
				</el-select>

				<!-- Radio Group with options -->
				<el-radio-group
					v-else-if="field.type === 'radio'"
					v-model="formData[field.fieldName as string]"
					v-bind="field.componentProps"
				>
					<el-radio
						v-for="option in field.componentProps?.options"
						:key="option.value"
						:label="option.value"
					>
						{{ option.label }}
					</el-radio>
				</el-radio-group>

				<!-- Checkbox Group with options -->
				<el-checkbox-group
					v-else-if="field.type === 'checkbox'"
					v-model="formData[field.fieldName as string]"
					v-bind="field.componentProps"
				>
					<el-checkbox
						v-for="option in field.componentProps?.options"
						:key="option.value"
						:label="option.value"
					>
						{{ option.label }}
					</el-checkbox>
				</el-checkbox-group>

				<!-- Textarea -->
				<el-input
					v-else-if="field.type === 'textarea'"
					v-model="formData[field.fieldName as string]"
					type="textarea"
					v-bind="field.componentProps"
				/>

				<!-- Other field types -->
				<component
					v-else
					:is="getFieldComponent(field)"
					v-model="formData[field.fieldName as string]"
					v-bind="field.componentProps"
				/>
			</el-form-item>

			<!-- Field actions -->
			<div class="field-actions">
				<Icon icon="ep:rank" class="action-icon drag-handle" title="Drag to reorder" />
				<Icon
					icon="ep:delete"
					class="action-icon delete-icon"
					title="Delete"
					@click.stop="handleDeleteField(field)"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.field-wrapper {
	position: relative;
	margin-bottom: 12px;
	transition: all 0.1s;
	border-radius: 4px;

	&:hover {
		.field-actions {
			z-index: 2;
			opacity: 1;
		}
	}

	&.selected {
		outline: 2px solid var(--el-color-primary);
		outline-offset: 2px;
		background: rgba(59, 130, 246, 0.05);
	}

	.field-content {
		position: relative;
	}

	.field-actions {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		gap: 8px;
		opacity: 0;
		transition: opacity 0.1s;
		background: var(--el-bg-color);
		padding: 4px 8px;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

		.action-icon {
			font-size: 16px;
			cursor: pointer;
			color: var(--el-text-color-secondary);
			transition: color 0.2s;

			&:hover {
				color: var(--el-color-primary);
			}

			&.delete-icon:hover {
				color: #ef4444;
			}

			&.drag-handle {
				cursor: grab;

				&:active {
					cursor: grabbing;
				}
			}
		}
	}
}
</style>
