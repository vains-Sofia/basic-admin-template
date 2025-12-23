<script setup lang="ts">
import type { FieldDefinition, FormExpose, FormSchema } from '@/components/FormDesigner'
import { computed, type ComputedRef, reactive, ref, watch } from 'vue'
import FieldItemViewer from './FieldItemViewer.vue'
import type { FormInstance, FormProps } from 'element-plus'
import { setupComputeEngine } from '@/components/FormDesigner/src/computeEngine.ts'
import { collectAllFields } from '@/components/FormDesigner/src/fieldRegistry.ts'

const props = defineProps<{
	// 表单配置json
	formJson: string
	// 表单绑定的数据
	formData?: Record<string, any>
	// el-form支持的props
	formNativeProps?: FormProps
}>()

const emit = defineEmits<{
	(e: 'update:formData', value: Record<string, any>): void
}>()

const formSchema: ComputedRef<FormSchema> = computed(() => JSON.parse(props.formJson))

/**
 * 根据默认值生成表单data
 * @param fields 动态表单的表单项
 * @param result 配置的默认的表单数据
 */
function buildDefaultFormData(fields: FieldDefinition[], result: Record<string, any> = {}) {
	for (const field of fields) {
		if (field.type === 'layout' && field.children?.length) {
			buildDefaultFormData(field.children, result)
			continue
		}

		if (field.fieldName && field.defaultValue !== undefined) {
			result[field.fieldName] = field.defaultValue
		}
	}
	return result
}

// 内部绑定的表单数据
const innerFormData = reactive<Record<string, any>>({})

const nativeProps = reactive(formSchema.value.formConfig || {})
// 预览器传入优先
Object.assign(nativeProps, props.formNativeProps)

/**
 * 监听动态表单schema，根据默认值实时更新绑定的表单数据
 */
watch(
	() => [formSchema, props.formData],
	() => {
		const defaultData = buildDefaultFormData(formSchema.value.fields)

		// 清空旧数据
		Object.keys(innerFormData).forEach((key) => delete innerFormData[key])

		// 先放 schema default
		Object.assign(innerFormData, defaultData)

		// 再覆盖外部传入的数据（优先级最高）
		if (props.formData) {
			Object.assign(innerFormData, props.formData)
		}
	},
	{ immediate: true, deep: true },
)

/**
 * 表单数据双向绑定实现
 */
watch(
	innerFormData,
	(val) => {
		emit('update:formData', { ...val })
	},
	{ deep: true },
)

const allFields = computed(() => collectAllFields(formSchema.value.fields))
setupComputeEngine(allFields.value, innerFormData)

const formRef = ref<FormInstance>()

defineExpose<FormExpose>({
	getValue(fieldName: string): any {
		return innerFormData[fieldName]
	},
	setValue(fieldName: string, value: any): void {
		innerFormData[fieldName] = value
	},
	clearValidate(field?: string): void {
		formRef.value?.clearValidate(field)
	},
	clearAllValidate(): void {
		formRef.value?.fields.forEach((field) => formRef.value?.clearValidate(field.prop))
	},
	getSchema(): FormSchema {
		return formSchema.value
	},
	reset(): void {
		formRef.value?.resetFields()
	},
	updateSchema(schema: FormSchema): void {
		if (!schema) return
		Object.assign(formSchema.value, schema)
	},
	getData(): Record<string, any> {
		return { ...innerFormData }
	},
	setData(data: Record<string, any>) {
		if (!data) return
		Object.assign(innerFormData, data)
	},
	validate() {
		if (!formRef.value) Promise.resolve(true)
		return new Promise((resolve) => {
			formRef.value?.validate((valid: boolean) => {
				resolve(valid)
			})
		})
	},
})
</script>

<template>
	<div class="form-viewer">
		<el-form ref="formRef" :model="innerFormData" v-bind="nativeProps" class="form-preview">
			<FieldItemViewer
				v-for="field in formSchema.fields"
				:form-data="innerFormData"
				:field="field"
				:form-config="formSchema.formConfig"
				:key="field.fieldId"
			/>
		</el-form>
	</div>
</template>

<style scoped>
.form-viewer {
	overflow-y: auto;
}
</style>
