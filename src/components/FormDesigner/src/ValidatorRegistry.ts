import type {
	DynamicValidator,
	FieldDefinition,
	PropertySchema,
	RuleSchema,
	ValidatorMethod,
} from '@/components/FormDesigner'
import type { FormItemRule } from 'element-plus'

export class ValidatorRegistry {
	private static validators = new Map<string, DynamicValidator>()

	static register(key: string, fn: DynamicValidator) {
		this.validators.set(key, fn)
	}

	static get(key: string) {
		return this.validators.get(key)
	}

	static has(key: string) {
		return this.validators.has(key)
	}
}

ValidatorRegistry.register('mobile', (rule, value, callback) => {
	if (!value) return
	if (!/^1[3-9]\d{9}$/.test(value)) {
		const message = typeof rule.message === 'function' ? rule.message() : rule.message
		callback(message ?? '手机号格式错误')
	} else {
		callback()
	}
})

ValidatorRegistry.register('pattern', (rule, value, callback) => {
	const valueStr = String(value)
	if (!valueStr) return
	const { pattern, message } = rule

	if (!pattern) return

	const reg = pattern instanceof RegExp ? pattern : new RegExp(pattern)

	if (!reg.test(String(valueStr))) {
		callback(typeof message === 'function' ? message() : message || '格式不正确')
	} else {
		callback()
	}
})

ValidatorRegistry.register('minLength', (rule, value, callback) => {
	const { min } = rule
	if (!min) {
		return
	}
	if (!value || value.length >= min) {
		callback()
	} else {
		callback(`最少 ${min} 个字符`)
	}
})

ValidatorRegistry.register('confirmEqual', (rule, value, callback, source) => {
	if (value !== source[rule.targetField]) {
		callback('两次输入不一致')
	} else {
		callback()
	}
})

/**
 * 根据内置的自定义验证器构建验证规则
 * @param ruleSchemas Json格式的验证规则
 * @param formData 表单数据
 */
export function buildElFormRules(ruleSchemas: RuleSchema[] = [], formData: any): FormItemRule[] {
	return ruleSchemas.map((r) => {
		const rule: FormItemRule = {
			required: r.required,
			message: r.message,
			trigger: r.trigger,
			pattern: r.validatorPattern ? new RegExp(r.validatorPattern) : undefined,
		}

		if (r.validatorKey) {
			const validator = ValidatorRegistry.get(r.validatorKey)

			if (!validator) {
				if (r.validatorKey !== 'required') {
					console.warn(`校验器未注册: ${r.validatorKey}`)
				}
			} else {
				rule.validator = (ruleObj, value, callback, source, options) => {
					Object.assign(ruleObj, r.validatorOptions || {})
					return validator(ruleObj as any, value, callback, formData, options)
				}
			}
		}

		return rule
	})
}

// 公共验证器配置
export const commonValidatorProperties: PropertySchema[] = [
	{
		key: 'trigger',
		label: '触发时机',
		type: 'select',
		defaultValue: 'blur',
		options: [
			{
				label: 'blur',
				value: 'blur',
			},
			{
				label: 'change',
				value: 'change',
			},
		],
		componentProps: {
			placeholder: '请选择触发时机',
		},
	},
]

// 默认验证器配置
export function validators(field?: FieldDefinition): ValidatorMethod[] {
	return [
		{
			method: 'required',
			title: '必填校验',
			properties: [
				...commonValidatorProperties,
				{
					key: 'message',
					label: '错误提示信息',
					type: 'input',
					defaultValue: `${field?.label}不能为空`,
					componentProps: {
						placeholder: '请输入错误提示信息',
					},
				},
			],
		},
		{
			method: 'mobile',
			title: '手机号',
			properties: [
				...commonValidatorProperties,
				{
					key: 'message',
					label: '错误提示信息',
					type: 'input',
					defaultValue: '请输入正确的手机号',
					componentProps: {
						placeholder: '请输入错误提示信息',
					},
				},
			],
		},
		{
			method: 'pattern',
			title: '正则校验',
			properties: [
				...commonValidatorProperties,
				{
					key: 'validatorPattern',
					label: '正则表达式',
					type: 'input',
					componentProps: {
						placeholder: '请输入正则表达式',
					},
				},
				{
					key: 'message',
					label: '错误提示信息',
					type: 'input',
					defaultValue: `${field?.label}格式错误`,
					componentProps: {
						placeholder: '请输入错误提示信息',
					},
				},
			],
		},
		{
			method: 'minLength',
			title: '最小长度限制',
			properties: [
				...commonValidatorProperties,
				{
					key: 'validatorOptions.min',
					label: '最小字符长度',
					type: 'number',
					defaultValue: 8,
					componentProps: {
						placeholder: '请输入最小字符长度',
					},
				},
				{
					key: 'message',
					label: '错误提示信息',
					type: 'input',
					componentProps: {
						placeholder: '请输入错误提示信息',
					},
				},
			],
		},
		{
			method: 'confirmEqual',
			title: '两次输入一致校验',
			properties: [
				...commonValidatorProperties,
				{
					key: 'validatorOptions.targetField',
					label: '比较的字段',
					type: 'fieldNames',
					componentProps: {
						placeholder: '请输入要比较的字段',
					},
				},
				{
					key: 'message',
					label: '错误提示信息',
					type: 'input',
					componentProps: {
						placeholder: '请输入错误提示信息',
					},
				},
			],
		},
	]
}

// 根据验证器获取配置属性
export function getValidatorMethod(method: string) {
	return validators().find((v) => v.method === method)?.properties
}
