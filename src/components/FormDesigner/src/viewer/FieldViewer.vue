<script setup lang="ts">
import type { FieldDefinition, FormConfig } from '@/components/FormDesigner'
import { getFieldComponent } from '../fieldRegistry.ts'
import { computed, reactive } from 'vue'
import { buildElFormRules } from '@/components/FormDesigner/src/ValidatorRegistry.ts'

const props = defineProps<{
	formData: any
	field: FieldDefinition
	formConfig: FormConfig
}>()

// 转为内部实例
const formDataInline = reactive(props.formData)

// 根据当前字段的校验规则和表单数据生成表单项的校验规则
const rules = computed(() => buildElFormRules(props.field.validationRules, formDataInline))
</script>

<template>
	<div class="field-content" :style="{ padding: `${formConfig.fieldPadding}px` }">
		<el-form-item
			:label="field.label"
			:prop="field.fieldName"
			:rules="rules"
			:label-width="field.labelWidth"
		>
			<!-- Select with options -->
			<el-select
				v-if="field.type === 'select'"
				v-model="formDataInline[field.fieldName]"
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
				v-model="formDataInline[field.fieldName]"
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
				v-model="formDataInline[field.fieldName]"
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
				v-model="formDataInline[field.fieldName]"
				type="textarea"
				v-bind="field.componentProps"
			/>

			<!-- Other field types -->
			<component
				v-else
				:is="getFieldComponent(field)"
				v-model="formDataInline[field.fieldName]"
				v-bind="field.componentProps"
			/>
		</el-form-item>
	</div>
</template>

<style scoped></style>
