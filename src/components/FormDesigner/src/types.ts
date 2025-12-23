/**
 * Form Designer Type Definitions
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
	/** 列数 Number of columns */
	columns?: number
	/** 间隔（px） Gap in pixels */
	gutter?: number
}

/** 布局配置属性（联合类型）Layout Props Union */
export type LayoutProps = RowLayoutProps | GridLayoutProps

/** Field definition in the form 表单中的字段定义 */
export interface FieldDefinition {
	/** Unique identifier within the form 字段唯一标识符 */
	fieldId: string
	/** Type identifier (input, select, datePicker, layout, etc.) 类型标识符 */
	type: string
	/** Display label for the field 字段显示标签 */
	label: string
	/** Display label for the field 字段显示中文标签 */
	labelCn: string
	/** Icon name (iconify format) 图标名称 */
	icon: string
	/** Label 宽度(px) */
	labelWidth?: number
	/** Category for grouping 分类 */
	category: 'basic' | 'selector' | 'datetime' | 'advanced' | 'layout'
	/** Data binding key 数据绑定键 */
	fieldName: string
	/** Type-specific configuration properties 类型特定的配置属性 */
	componentProps: Record<string, any>
	/** Validation constraints 验证约束 */
	validationRules: RuleSchema[]
	/** Initial value for the field 字段初始值 */
	defaultValue?: any
	/** Parent layout ID (字段在布局内时有值) Parent container ID if nested in layout */
	parentId?: string | null
	/** Layout type (仅布局类型有此属性) Layout type for layout fields */
	layoutType?: LayoutType
	/** Layout props (仅布局类型有此属性) Layout configuration for layout fields */
	layoutProps?: LayoutProps
	/** Layout type (仅布局类型有此属性) el-col属性 */
	colProps?: Record<string, any>
	/** Children fields (仅布局类型有此属性) Nested fields for layout containers */
	children?: Array<FieldDefinition>
	/** 计算规则 */
	compute?: ComputeRule
	/** 值类型 */
	valueType?: string
}

/** Form configuration */
export interface FormConfig {
	/** Global label width for all fields */
	labelWidth?: number | string
	/** Alignment of labels (left, right, top) */
	labelPosition?: 'left' | 'right' | 'top'
	/** Component size (large, default, small) */
	size?: 'large' | 'default' | 'small'
	/** When to validate (blur, change, submit) */
	validateTrigger?: 'blur' | 'change' | 'submit'
	/** Inline form layout */
	inline?: boolean
	/** 字段padding长度(px) */
	fieldPadding: number
}

/** Complete form schema */
export interface FormSchema {
	/** Unique identifier for the form */
	formId: string
	/** Display name of the form */
	formName: string
	/** Global form settings */
	formConfig: FormConfig
	/** Ordered collection of form field definitions */
	fields: FieldDefinition[]
}

/** Option item for select/radio/checkbox */
export interface OptionItem {
	/** Display label */
	label: string
	/** Value */
	value: string | number | boolean
}

/** Field type configuration for registry 字段类型注册表配置 */
export interface FieldTypeConfig {
	/** Field type identifier 字段类型标识符 */
	type: string
	/** Display name in component library 组件库中的显示名称 */
	label: string
	/** Icon name (iconify format) 图标名称 */
	icon: string
	/** Category for grouping 分类 */
	category: 'basic' | 'selector' | 'datetime' | 'advanced' | 'layout'
	/** Default properties for new instances 默认属性 */
	defaultProps: Partial<FieldDefinition>
	/** Property schema for property panel 属性面板的属性架构 */
	propertySchema: PropertySchema[]
}

/** Property definition for property panel */
export interface PropertySchema {
	/** Property key */
	key: string
	/** Display label */
	label: string
	/** Input type (input, number, select, switch, textarea, options) */
	type: 'input' | 'number' | 'select' | 'switch' | 'textarea' | 'options' | 'slider' | 'validator' | 'fieldNames' | 'ComputeFormat'
	/** Default value */
	defaultValue?: any
	/** Options for select type */
	options?: Array<OptionItem>
	/** Type-specific configuration properties 类型特定的配置属性 */
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

export type DynamicValidator = (
	rule: FormItemRule & Record<string, any>,
	value: any,
	callback: (error?: string | Error) => void,
	source: Record<string, any>,
	options: any
) => void

export interface ValidatorMethod {
	method: string
	title: string
	description?: string
	properties?: PropertySchema[]
}

export type TimeUnit =
	| 'ms'
	| 'second'
	| 'minute'
	| 'hour'
	| 'day'

export interface TimeUnitItem {
	value: TimeUnit
	label: string
}

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
