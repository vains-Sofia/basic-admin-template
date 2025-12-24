/**
 * 表单设计器类型定义
 */

import type { FormItemRule } from 'element-plus'

/** 布局类型 Layout Type */
export type LayoutType = 'row' | 'grid' | 'col'

/** 行布局属性 Row Layout Props */
export interface RowLayoutProps {
	/** 栅格间隔（px） Grid gutter in pixels */
	gutter?: number
	/** 水平排列方式 Horizontal alignment */
	justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
	/** 垂直对齐方式 Vertical alignment */
	align?: 'top' | 'middle' | 'bottom'
}

/** 栅格布局属性 Grid Layout Props */
export interface GridLayoutProps {
	/** 列数 */
	columns?: number
	/** 间隔（px） */
	gutter?: number
}

/** 布局配置属性（联合类型）Layout Props Union */
export type LayoutProps = RowLayoutProps | GridLayoutProps

/** 表单中的字段定义 */
export interface FieldDefinition {
	/** 字段唯一标识符 */
	fieldId: string
	/** 类型标识符 (input, select, datePicker, layout, etc.) */
	type: string
	/** 字段显示标签 */
	label: string
	/** 字段显示中文标签 */
	labelCn: string
	/** 图标名称(iconify format) */
	icon: string
	/** Label 宽度(px) */
	labelWidth?: number
	/** 分类 */
	category: 'basic' | 'selector' | 'datetime' | 'advanced' | 'layout'
	/** 数据绑定属性名 */
	fieldName: string
	/** 类型特定的配置属性 */
	componentProps: Record<string, any>
	/** 验证约束 */
	validationRules: RuleSchema[]
	/** 字段初始值 */
	defaultValue?: any
	/** 父布局ID (字段在布局内时有值) */
	parentId?: string | null
	/** 布局类型 (仅布局类型有此属性) */
	layoutType?: LayoutType
	/** 布局(el-row)组件属性 (仅布局类型有此属性) */
	layoutProps?: LayoutProps
	/** el-col属性 (仅布局类型有此属性)  */
	colProps?: Record<string, any>
	/** 布局内的表单项 (仅布局类型有此属性) */
	children?: Array<FieldDefinition>
	/** 计算规则 */
	compute?: ComputeRule
	/** 值类型 */
	valueType?: string
}

/** Form configuration */
export interface FormConfig {
	/** 全局Label宽度，对所有表单项生效 */
	labelWidth?: number | string
	/** Label的位置(left, right, top) */
	labelPosition?: 'left' | 'right' | 'top'
	/** 组件尺寸 (large, default, small) */
	size?: 'large' | 'default' | 'small'
	/** 验证触发时机 (blur, change, submit) */
	validateTrigger?: 'blur' | 'change' | 'submit'
	/** 行内表单 */
	inline?: boolean
	/** 字段padding长度(px) */
	fieldPadding: number
}

/** Complete form schema */
export interface FormSchema {
	/** 表单唯一id */
	formId: string
	/** 表单名称，下载后文件名 */
	formName: string
	/** 表单配置 */
	formConfig: FormConfig
	/** 表单内所有表单项 */
	fields: FieldDefinition[]
}

/** select/radio/checkbox 的选择项  */
export interface OptionItem {
	/** 展示文本 */
	label: string
	/** 值 */
	value: string | number | boolean
}

/** 字段类型注册表配置 */
export interface FieldTypeConfig {
	/** 字段类型标识符 */
	type: string
	/** 组件库中的显示名称 */
	label: string
	/** 图标名称 (iconify format) */
	icon: string
	/** 分类 */
	category: 'basic' | 'selector' | 'datetime' | 'advanced' | 'layout'
	/** 默认属性 */
	defaultProps: Partial<FieldDefinition>
	/** 属性面板的属性架构 */
	propertySchema: PropertySchema[]
}

/** 属性面板中的属性定义 */
export interface PropertySchema {
	/** 配置key(表单项配置名，例如fieldName、componentProps.min) */
	key: string
	/** 在属性面板中展示的名称 */
	label: string
	/** 配置面板中呈现的表单项的类型 (input, number, select, switch, textarea, options) */
	type:
		| 'input'
		| 'number'
		| 'select'
		| 'switch'
		| 'textarea'
		| 'options'
		| 'slider'
		| 'validator'
		| 'fieldNames'
		| 'ComputeFormat'
	/** 默认值 */
	defaultValue?: any
	/** 如果是下拉框则是可选项 */
	options?: Array<OptionItem>
	/** 类型特定的配置属性 */
	componentProps?: Record<string, any>
}

export interface FormExpose {
	// 数据
	getData(): Record<string, any>
	setData(data: Record<string, any>): void

	// 校验
	validate(): Promise<boolean>
	clearValidate(field?: string): void
	clearAllValidate(): void

	// 控制
	reset(): void

	// schema
	getSchema(): FormSchema
	updateSchema(schema: FormSchema): void

	getValue(fieldName: string): any

	setValue(fieldName: string, value: any): void
}

export interface RuleSchema {
	/** 是否必填 */
	required?: boolean
	/** 提示信息 */
	message?: string
	/** 触发时机 */
	trigger?: 'blur' | 'change'

	/** 自定义校验器标识 */
	validatorKey?: string

	/** 正则表达式 */
	validatorPattern?: string

	/** 校验器参数 */
	validatorOptions?: Record<string, any>
}

/**
 * 动态验证器
 */
export type DynamicValidator = (
	// 校验规则
	rule: FormItemRule & Record<string, any>,
	// 被校验表单项的值
	value: any,
	// 校验成功/失败回调
	callback: (error?: string | Error) => void,
	// 表单绑定的数据
	source: Record<string, any>,
	// 验证器额外参数
	options: any,
) => void

/**
 * 表单项校验规则类型定义
 */
export interface ValidatorMethod {
	/** 校验方式 */
	method: string
	/** 校验方式名称 */
	title: string
	/** 描述，暂未用到 */
	description?: string
	/** 校验配置列表 */
	properties?: PropertySchema[]
}

/**
 * 格式化时间单位
 */
export type TimeUnit = 'ms' | 'second' | 'minute' | 'hour' | 'day'

/**
 * 时间单位下拉类型定义
 */
export interface TimeUnitItem {
	value: TimeUnit
	label: string
}

/**
 * 属性计算配置类型定义
 */
export interface ComputeRule {
	/** 公式：price * count */
	expression: string
	/** 依赖字段 */
	dependsOn: string[]
	/** 小数精度 */
	precision?: number
	/** 结果单位（用于日期 / 时长计算） */
	unit?: TimeUnit
}

/**
 * 类型守卫函数：判断字段是否为布局类型
 * Type guard: Check if field is a layout type
 */
export function isLayoutField(field: FieldDefinition): boolean {
	return field.type === 'layout' && !!field.layoutType
}
