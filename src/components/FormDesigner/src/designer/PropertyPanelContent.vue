<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type {
	FieldDefinition,
	FormSchema,
	PropertySchema,
	RuleSchema,
} from '@/components/FormDesigner'
import { computed, ref, watch } from 'vue'
import { getValidatorMethod, validators } from '../ValidatorRegistry.ts'
import { collectAllFieldNames, collectAllFields, getFormatByValue } from '../fieldRegistry.ts'
import { extractDependencies, timeUnitLabels } from '../computeEngine.ts'

const props = defineProps<{
	formSchema: FormSchema
	ruleProperty?: RuleSchema
	selectedField?: FieldDefinition
	propertySchema: PropertySchema[]
	formProperties: Record<string, any>
}>()

const emit = defineEmits<{
	updateFormProperty: [key: string, value: any]
	updateFieldProperty: [fieldId: string, key: string, value: any]
	updateRuleProperty: [rule: RuleSchema, key: string, value: any]
}>()

// 获取当前表单中的所有字段名
const fieldNames = computed(() => collectAllFieldNames(props.formSchema.fields))
// 获取当前表单中的所有字段名
const allFields = computed(() => collectAllFields(props.formSchema.fields))

// 监听并计算依赖的字段是否包含日期类型
const datePickerType = ['date', 'datetime', 'time']
const computeDateType = ref(false)
watch(
	props,
	() => {
		const dependsOn = props.selectedField?.compute?.dependsOn
		const dependsOnFields = computed(() =>
			dependsOn?.map((key) => allFields.value.find((ff) => ff.fieldName === key)),
		)
		const dateFields =
			dependsOnFields.value?.filter((f) => datePickerType.includes(f?.valueType ?? '')) ?? []
		computeDateType.value = dateFields.length > 0
	},
	{ immediate: true, deep: true },
)

const properties = computed(() => props.ruleProperty ?? props.selectedField ?? props.formProperties)

function handleFieldPropertyChange() {
	// Emit changes will be handled by setPropertyValue
}

function getPropertyValue(key: string, property?: PropertySchema): any {
	if (!properties.value) return undefined

	// Handle nested properties (e.g., componentProps.maxlength)
	const keys = key.split('.')
	let value: any = properties.value

	for (const k of keys) {
		if (value && typeof value === 'object') {
			value = value[k]
		} else {
			return undefined
		}
	}

	return value ?? property?.defaultValue
}

function setPropertyValue(key: string, value: any) {
	// 日期选择器特殊处理
	const datePickerTypes = ['datePicker', 'datePickerRange']
	if (datePickerTypes.includes(props.selectedField?.type ?? '') && key === 'componentProps.type') {
		const datePickerFormats = ['componentProps.format', 'componentProps.valueFormat']
		// 根据选择的类型自动设置对应的格式
		datePickerFormats.forEach((k) => setPropertyValue(k, getFormatByValue(value)))
	}

	// 计算公式特殊处理
	if (key === 'compute.expression') {
		setPropertyValue('compute.dependsOn', extractDependencies(value))
	}

	// 校验规则特殊处理
	if (props.ruleProperty) {
		emit('updateRuleProperty', props.ruleProperty, key, value)
		return
	}

	// 字段
	if (props.selectedField) {
		emit('updateFieldProperty', props.selectedField.fieldId, key, value)
	} else {
		// 表单
		emit('updateFormProperty', key, value)
	}
}

/**
 * 添加验证规则
 * @param validatorKey 自定义校验器标识
 * @param properties 配置表单项
 */
const addValidator = (validatorKey: string, properties?: PropertySchema[]) => {
	const validators = getPropertyValue('validationRules') as RuleSchema[]
	if (validators.find((v) => v.validatorKey === 'required')) {
		if (validatorKey === 'required') {
			ElMessage.info('不能重复添加必填校验')
			return
		}
	}
	if (properties && properties.length > 0) {
		const defaultValues: any = {}
		// 添加校验规则时填充属性配置中的默认值
		properties.forEach((p) => {
			const keys = p.key.split('.')
			let target: any = defaultValues

			for (let i = 0; i < keys.length - 1; i++) {
				const k = keys[i]
				if (!target[k] || typeof target[k] !== 'object') {
					target[k] = {}
				}
				target = target[k]
			}

			target[keys[keys.length - 1]] = p.defaultValue
		})
		validators.push({ validatorKey, required: validatorKey === 'required', ...defaultValues })
	} else {
		validators.push({ validatorKey, required: validatorKey === 'required' })
	}
	// 更新字段的校验规则
	setPropertyValue('validationRules', validators)
}

function addOption(key: string) {
	const options = getPropertyValue(key) || []
	options.push({ label: `Option ${options.length + 1}`, value: String(options.length + 1) })
	setPropertyValue(key, options)
}

function removeOption(key: string, index: number) {
	const options = getPropertyValue(key) || []
	options.splice(index, 1)
	setPropertyValue(key, options)
}

function handleNumberChange(value: any, key: string) {
	setPropertyValue(key, value)
}

// Update field property
function handleUpdateFieldProperty(rule: RuleSchema, key: string, value: any) {
	if (!rule) {
		return
	}
	const keys = key.split('.')
	let target: any = rule

	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i]
		if (!target[k] || typeof target[k] !== 'object') {
			target[k] = {}
		}
		target = target[k]
	}

	target[keys[keys.length - 1]] = value
}
</script>

<template>
	<template v-for="prop in propertySchema" :key="prop.key">
		<!-- Text Input -->
		<el-form-item v-if="prop.type === 'input'" :label="prop.label">
			<el-input
				:model-value="getPropertyValue(prop.key, prop)"
				@input="(val) => setPropertyValue(prop.key, val)"
				v-bind="prop.componentProps"
			/>
		</el-form-item>

		<!-- Number Input -->
		<el-form-item v-else-if="prop.type === 'number'" :label="prop.label">
			<el-input-number
				:model-value="getPropertyValue(prop.key, prop)"
				v-bind="prop.componentProps"
				@change="handleNumberChange($event, prop.key)"
			/>
		</el-form-item>

		<!-- Textarea -->
		<el-form-item v-else-if="prop.type === 'textarea'" :label="prop.label">
			<el-input
				:model-value="getPropertyValue(prop.key, prop)"
				type="textarea"
				v-bind="prop.componentProps"
				@input="(val) => setPropertyValue(prop.key, val)"
			/>
		</el-form-item>

		<!-- Switch -->
		<el-form-item v-else-if="prop.type === 'switch'" :label="prop.label">
			<el-switch
				:model-value="getPropertyValue(prop.key, prop)"
				@change="(val) => setPropertyValue(prop.key, val)"
				v-bind="prop.componentProps"
			/>
		</el-form-item>

		<!-- Select -->
		<el-form-item v-else-if="prop.type === 'select'" :label="prop.label">
			<el-select
				:model-value="getPropertyValue(prop.key, prop)"
				@change="(val) => setPropertyValue(prop.key, val)"
				v-bind="prop.componentProps"
			>
				<el-option
					v-for="opt in prop.options"
					:key="`${opt.label}${opt.value}`"
					:label="opt.label"
					:value="opt.value"
					:disabled="prop.componentProps?.readonly"
				/>
			</el-select>
		</el-form-item>

		<!-- 选择fieldNames -->
		<el-form-item v-else-if="prop.type === 'fieldNames'" :label="prop.label">
			<el-select
				clearable
				filterable
				:model-value="getPropertyValue(prop.key, prop)"
				v-bind="prop.componentProps"
				@change="(val) => setPropertyValue(prop.key, val)"
			>
				<el-option
					v-for="opt in fieldNames.filter((f) => f.value !== selectedField?.fieldName)"
					:key="`${opt.label}${opt.value}`"
					:label="opt.label"
					:value="opt.value"
					:disabled="prop.componentProps?.readonly"
				/>
			</el-select>
		</el-form-item>

		<!-- 公式计算格式化 -->
		<el-form-item v-else-if="prop.type === 'ComputeFormat'" :label="prop.label">
			<el-select
				v-if="computeDateType"
				clearable
				filterable
				:model-value="getPropertyValue('compute.unit', prop)"
				placeholder="请选择单位"
				@change="(val) => setPropertyValue('compute.unit', val)"
			>
				<el-option
					v-for="opt in timeUnitLabels"
					:key="`${opt.label}${opt.value}`"
					:label="opt.label"
					:value="opt.value"
				/>
			</el-select>
			<el-input-number
				v-else
				:model-value="getPropertyValue(prop.key, prop)"
				placeholder="设置保留位数"
				@change="handleNumberChange($event, prop.key)"
				v-bind="prop.componentProps"
			/>
		</el-form-item>

		<!-- Slider -->
		<el-form-item v-else-if="prop.type === 'slider'" :label="prop.label">
			<el-slider
				:model-value="getPropertyValue(prop.key, prop)"
				v-bind="prop.componentProps"
				@change="handleNumberChange($event, prop.key)"
			/>
		</el-form-item>

		<!-- Options Editor (for select/radio/checkbox) -->
		<el-form-item v-else-if="prop.type === 'options'" :label="prop.label">
			<div class="options-editor">
				<div
					v-for="(option, idx) in getPropertyValue(prop.key, prop)"
					:key="idx"
					class="option-item"
				>
					<el-input
						v-model="option.label"
						placeholder="Label"
						size="small"
						@input="handleFieldPropertyChange"
					/>
					<el-input
						v-model="option.value"
						placeholder="Value"
						size="small"
						@input="handleFieldPropertyChange"
					/>
					<el-button
						type="danger"
						size="small"
						circle
						@click="removeOption(prop.key, idx)"
					>
						<Icon icon="ep:delete" />
					</el-button>
				</div>
				<el-button type="primary" @click="addOption(prop.key)"> Add Option </el-button>
			</div>
		</el-form-item>

		<!-- Validator Editor -->
		<div v-else-if="prop.type === 'validator'">
			<template
				v-for="(rule, i) in getPropertyValue('validationRules', prop) as RuleSchema[]"
				:key="i"
			>
				<div class="validator-header">
					<div style="font-weight: bold">
						{{
							validators(selectedField).find((e) => e.method === rule.validatorKey)
								?.title
						}}
					</div>
					<Icon
						icon="ep:delete"
						@click="
							setPropertyValue(
								'validationRules',
								(getPropertyValue('validationRules', prop) as RuleSchema[]).filter(
									(_, idx) => idx !== i,
								),
							)
						"
					/>
				</div>
				<PropertyPanelContent
					:rule-property="rule"
					:form-schema="formSchema"
					:selected-field="selectedField"
					:form-properties="formProperties"
					:property-schema="getValidatorMethod(rule.validatorKey as string) ?? []"
					@update-rule-property="handleUpdateFieldProperty"
				/>
			</template>
			<el-dropdown style="width: 100%; padding-bottom: 12px">
				<el-button type="text"> 添加校验规则 </el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item
							v-for="method in validators(selectedField)"
							@click="addValidator(method.method, method.properties)"
							:key="method.method"
						>
							{{ method.title }}
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>
	</template>
</template>

<style scoped lang="scss">
.validator-header {
	width: 100%;
	display: flex;
	overflow: hidden;
	white-space: nowrap;
	align-items: center;
	justify-content: space-between;

	svg {
		cursor: pointer;
		color: var(--el-color-danger);
	}
}

/* el-dropdown hover有黑框问题解决 */
:global(.el-tooltip__trigger:focus-visible) {
	outline: unset;
	cursor: pointer;
}

.options-editor {
	display: flex;
	flex-direction: column;
	gap: 8px;

	.option-item {
		display: flex;
		gap: 8px;
		align-items: center;

		.el-input {
			flex: 1;
		}
	}
}

:deep(.el-form-item) {
	margin-bottom: 16px;
}

:deep(.el-form-item__label) {
	font-size: 13px;
	font-weight: 500;
}

:deep(.el-select) {
	width: 100%;
}

:deep(.el-input-number) {
	width: 100%;
}
</style>
