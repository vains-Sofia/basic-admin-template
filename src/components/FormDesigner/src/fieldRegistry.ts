/**
 * Field Type Registry - Built-in field types configuration
 */

import type { FieldDefinition, OptionItem, PropertySchema } from './types'

/** Common property schemas */
const commonProperties: PropertySchema[] = [
	{
		key: 'label',
		label: '字段显示文字',
		type: 'input',
		defaultValue: '',
		componentProps: {
			placeholder: '请输入字段显示文字',
		}
	},
	{
		key: 'fieldName',
		label: '字段属性名',
		type: 'input',
		componentProps: {
			placeholder: '请输入字段属性名(e.g., username)',
		}
	},
	{
		key: 'labelWidth',
		label: 'Label 宽度(px)',
		type: 'number',
		defaultValue: 120,
		componentProps: {
			min: 1,
		}
	},
	{
		key: 'componentProps.placeholder',
		label: '提示内容',
		type: 'input',
		defaultValue: '',
		componentProps: {
			placeholder: '请输入提示内容',
		}
	},
	// {
	// 	key: 'required',
	// 	label: '必填',
	// 	type: 'switch',
	// 	defaultValue: false,
	// },
	{
		key: 'validator',
		label: '开启字段校验',
		type: 'validator',
		defaultValue: false,
	},
	{
		key: 'compute.expression',
		label: '计算公式',
		type: 'input',
		componentProps: {
			placeholder: '请输入计算公式',
		}
	},
	{
		key: 'compute.dependsOn',
		label: '依赖字段',
		type: 'fieldNames',
		componentProps: {
			multiple: true,
			readonly: true,
		}
	},
	{
		key: 'compute.precision',
		label: '格式化',
		type: 'ComputeFormat',
		componentProps: {
			min: 0,
			max: 10,
		}
	},
	{
		key: 'componentProps.readonly',
		label: '只读',
		type: 'switch',
		defaultValue: false,
	},
	{
		key: 'defaultValue',
		label: '默认值',
		type: 'input',
		defaultValue: '',
		componentProps: {
			placeholder: '初始化表单时会默认填充该值',
		}
	},
]

// 日期格式和Label
export const dateTypeLabels = [
	{ label: 'Date', value: 'date' },
	{ label: 'Date Time', value: 'datetime' },
	{ label: 'Date Range', value: 'daterange' },
	{ label: 'Date Time Range', value: 'datetimerange' },
	{ label: 'Month', value: 'month' },
	{ label: 'Year', value: 'year' },
]

export const dateFormats = [
	{ format: 'YYYY-MM-DD', value: 'date' },
	{ format: 'YYYY-MM-DD HH:mm:ss', value: 'datetime' },
	{ format: 'YYYY-MM-DD', value: 'daterange' },
	{ format: 'YYYY-MM-DD HH:mm:ss', value: 'datetimerange' },
	{ format: 'MM', value: 'month' },
	{ format: 'YYYY', value: 'year' },
]

export const propertySchemas: Record<string, PropertySchema[]> = {
	form: [
		{
			key: 'formName',
			label: '表单名称',
			type: 'input',
			defaultValue: '表单',
			componentProps: {
				placeholder: '请输入表单名称',
			}
		},
		{
			key: 'labelWidth',
			label: 'Label 宽度(px)',
			type: 'number',
			componentProps: {
				min: 0,
				placeholder: '请输入Label 宽度(px)',
			},
			defaultValue: 120,
		},
		{
			key: 'labelPosition',
			label: 'Label 位置',
			type: 'select',
			defaultValue: 'right',
			options: [
				{ label: 'Left', value: 'left' },
				{ label: 'Right', value: 'right' },
				{ label: 'Top', value: 'top' },
			],
			componentProps: {
				min: 0,
				placeholder: '请选择Label位置',
			},
		},
		{
			key: 'size',
			type: 'select',
			label: '表单尺寸',
			defaultValue: 'default',
			options: [
				{ label: '大', value: 'Large' },
				{ label: '默认', value: 'default' },
				{ label: '小', value: 'small' },
			],
			componentProps: {
				min: 0,
			},
		},
		{
			key: 'fieldPadding',
			label: '字段padding(px)',
			type: 'number',
			defaultValue: 5,
			componentProps: {
				min: 0,
			},
		},
	],
	input: [
		...commonProperties,
		{
			key: 'componentProps.maxlength',
			label: '最大输入限制',
			type: 'number',
			componentProps: {
				min: 0,
				placeholder: '默认不限制',
			},
		},
		{
			key: 'componentProps.showWordLimit',
			label: '显示字符数量与限制',
			type: 'switch',
			defaultValue: false,
			componentProps: {},
		},
		{
			key: 'componentProps.clearable',
			label: '清除图标',
			type: 'switch',
			defaultValue: true,
			componentProps: {},
		},
	],
	textarea: [
		...commonProperties.filter((p) => p.key !== 'componentProps.placeholder'),
		{
			key: 'componentProps.placeholder',
			label: '提示内容',
			type: 'textarea',
			defaultValue: '',
			componentProps: {
				rows: 3,
				placeholder: '请输入文本域提示内容',
			},
		},
		{
			key: 'componentProps.rows',
			label: '行数',
			type: 'number',
			defaultValue: 4,
			componentProps: {
				min: 2,
				max: 20,
			},
		},
		{
			key: 'componentProps.maxlength',
			label: '最大输入限制',
			type: 'number',
			componentProps: {
				min: 0,
			},
		},
		{
			key: 'componentProps.showWordLimit',
			label: '显示字符数量与限制',
			type: 'switch',
			defaultValue: true,
		},
	],
	number: [
		...commonProperties,
		{
			key: 'componentProps.min',
			label: '最小值',
			type: 'number',
			componentProps: {
				placeholder: '最小值',
			}
		},
		{
			key: 'componentProps.max',
			label: '最大值',
			type: 'number',
			componentProps: {
				placeholder: '最大值',
			}
		},
		{
			key: 'componentProps.step',
			label: '步进值',
			type: 'number',
			defaultValue: 1,
			componentProps: {
				min: 1,
			}
		},
		{
			key: 'componentProps.precision',
			label: '精度',
			type: 'number',
			componentProps: {
				min: 0,
				placeholder: '小数点位数',
			}
		},
	],
	password: [
		...commonProperties,
		{
			key: 'componentProps.showPassword',
			label: '显示/隐藏密码图标',
			type: 'switch',
			defaultValue: true,
		},
		{
			key: 'componentProps.clearable',
			label: '清除图标',
			type: 'switch',
			defaultValue: true,
		},
	],
	select: [
		...commonProperties,
		{
			key: 'componentProps.options',
			label: 'Options',
			type: 'options',
			defaultValue: [
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
		},
		{
			key: 'componentProps.multiple',
			label: '多选',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.clearable',
			label: '清除图标',
			type: 'switch',
			defaultValue: true,
		},
		{
			key: 'componentProps.filterable',
			label: '支持搜索',
			type: 'switch',
			defaultValue: true,
		},
	],
	radio: [
		...commonProperties.filter(
			(p) => p.key !== 'componentProps.placeholder' && p.key !== 'componentProps.readonly',
		),
		{
			key: 'componentProps.disabled',
			label: '禁用',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.options',
			label: 'Options',
			type: 'options',
			defaultValue: [
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
		},
	],
	checkbox: [
		...commonProperties.filter(
			(p) => p.key !== 'componentProps.placeholder' && p.key !== 'componentProps.readonly',
		),
		{
			key: 'componentProps.disabled',
			label: '禁用',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.options',
			label: 'Options',
			type: 'options',
			defaultValue: [
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
		},
	],
	switch: [
		...commonProperties.filter(
			(p) =>
				p.key !== 'componentProps.placeholder' &&
				p.key !== 'defaultValue' &&
				p.key !== 'componentProps.readonly',
		),
		{
			key: 'componentProps.disabled',
			label: '禁用',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'defaultValue',
			label: '默认值',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.activeText',
			label: '打开文字',
			type: 'input',
			defaultValue: '',
		},
		{
			key: 'componentProps.inactiveText',
			label: '关闭文字',
			type: 'input',
			defaultValue: '',
		},
	],
	datePicker: [
		...commonProperties,
		{
			key: 'componentProps.type',
			label: '选择器类型',
			type: 'select',
			defaultValue: 'date',
			options: dateTypeLabels.filter((p) => !p.value.includes('range')),
		},
		{
			key: 'componentProps.format',
			label: '显示格式',
			type: 'select',
			defaultValue: 'YYYY-MM-DD',
			options: [
				{ label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
				{ label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
				{ label: 'YYYY-MM', value: 'YYYY-MM' },
				{ label: 'YYYY', value: 'YYYY' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
		{
			key: 'componentProps.valueFormat',
			label: '值格式',
			type: 'select',
			defaultValue: 'YYYY-MM-DD',
			options: [
				{ label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
				{ label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
				{ label: 'YYYY-MM', value: 'YYYY-MM' },
				{ label: 'YYYY', value: 'YYYY' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
	],
	timePicker: [
		...commonProperties,
		{
			key: 'componentProps.format',
			label: '显示格式',
			type: 'select',
			defaultValue: 'HH:mm:ss',
			options: [
				{ label: 'HH:mm', value: 'HH:mm' },
				{ label: 'HH:mm:ss', value: 'HH:mm:ss' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
		{
			key: 'componentProps.valueFormat',
			label: '值格式',
			type: 'select',
			defaultValue: 'HH:mm:ss',
			options: [
				{ label: 'HH:mm', value: 'HH:mm' },
				{ label: 'HH:mm:ss', value: 'HH:mm:ss' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
	],
	datePickerRange: [
		...commonProperties.filter(
			(p) => p.key !== 'componentProps.placeholder'),
		{
			key: 'componentProps.startPlaceholder',
			label: '开始日期提示内容',
			type: 'input',
			defaultValue: '开始日期',
			componentProps: {
				placeholder: '开始日期提示内容'
			}
		},
		{
			key: 'componentProps.endPlaceholder',
			label: '结束日期提示内容',
			type: 'input',
			defaultValue: '结束日期',
			componentProps: {
				placeholder: '结束日期提示内容'
			}
		},
		{
			key: 'componentProps.type',
			label: '选择器类型',
			type: 'select',
			defaultValue: 'date',
			options: dateTypeLabels.filter((p) => p.value.includes('range')),
		},
		{
			key: 'componentProps.format',
			label: '显示格式',
			type: 'select',
			defaultValue: 'YYYY-MM-DD',
			options: [
				{ label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
				{ label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
				{ label: 'YYYY-MM', value: 'YYYY-MM' },
				{ label: 'YYYY', value: 'YYYY' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
		{
			key: 'componentProps.valueFormat',
			label: '值格式',
			type: 'select',
			defaultValue: 'YYYY-MM-DD',
			options: [
				{ label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
				{ label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
				{ label: 'MM', value: 'MM' },
				{ label: 'YYYY', value: 'YYYY' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
	],
	timePickerRange: [
		...commonProperties,
		{
			key: 'componentProps.startPlaceholder',
			label: '开始时间提示内容',
			type: 'input',
			defaultValue: '开始时间',
			componentProps: {
				placeholder: '开始时间提示内容'
			}
		},
		{
			key: 'componentProps.endPlaceholder',
			label: '结束时间提示内容',
			type: 'input',
			defaultValue: '结束时间',
			componentProps: {
				placeholder: '结束时间提示内容'
			}
		},
		{
			key: 'componentProps.format',
			label: '显示格式',
			type: 'select',
			defaultValue: 'HH:mm:ss',
			options: [
				{ label: 'HH:mm', value: 'HH:mm' },
				{ label: 'HH:mm:ss', value: 'HH:mm:ss' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
		{
			key: 'componentProps.valueFormat',
			label: '值格式',
			type: 'select',
			defaultValue: 'HH:mm:ss',
			options: [
				{ label: 'HH:mm', value: 'HH:mm' },
				{ label: 'HH:mm:ss', value: 'HH:mm:ss' },
			],
			componentProps: {
				filterable: true,
				allowCreate: true,
				defaultFirstOption: true,
			}
		},
	],
	rate: [
		...commonProperties.filter((p) => p.key !== 'componentProps.placeholder' && p.key !== 'componentProps.readonly'),
		{
			key: 'componentProps.disabled',
			label: '禁用',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.max',
			label: '最大星星数量',
			type: 'number',
			defaultValue: 5,
			componentProps: {
				min: 1,
				max: 10,
			}
		},
		{
			key: 'componentProps.allowHalf',
			label: '支持半选',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.showText',
			label: '显示文字',
			type: 'switch',
			defaultValue: false,
		},
	],
	slider: [
		...commonProperties.filter((p) => p.key !== 'componentProps.placeholder' && p.key !== 'componentProps.readonly'),
		{
			key: 'componentProps.disabled',
			label: '禁用',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.min',
			label: '最小值',
			type: 'number',
			defaultValue: 0,
			componentProps: {
				placeholder: '最小值',
			}
		},
		{
			key: 'componentProps.max',
			label: '最大值',
			type: 'number',
			defaultValue: 100,
			componentProps: {
				placeholder: '最大值',
			}
		},
		{
			key: 'componentProps.step',
			label: '步长',
			type: 'number',
			defaultValue: 1,
			componentProps: {
				min: 1,
			}
		},
		{
			key: 'componentProps.showStops',
			label: '是否显示间断点',
			type: 'switch',
			defaultValue: false,
		},
	],
	colorPicker: [
		...commonProperties.filter((p) => p.key !== 'componentProps.placeholder' && p.key !== 'componentProps.readonly'),
		{
			key: 'componentProps.disabled',
			label: '禁用',
			type: 'switch',
			defaultValue: false,
		},
		{
			key: 'componentProps.showAlpha',
			label: '选择透明度',
			type: 'switch',
			defaultValue: false,
		},
	],
	row: [
		// {
		// 	key: 'label',
		// 	label: '布局名称',
		// 	type: 'input',
		// 	defaultValue: '',
		// 	placeholder: '请输入布局名称',
		// },
		// {
		// 	key: 'layoutType',
		// 	label: '布局类型',
		// 	type: 'select',
		// 	defaultValue: 'row',
		// 	options: [
		// 		{ label: '行布局', value: 'row' },
		// 		{ label: '栅格布局', value: 'grid' },
		// 	],
		// },
		{
			key: 'layoutProps.gutter',
			label: '栅格间隔',
			type: 'number',
			defaultValue: 0,
			componentProps: {
				min: 0,
				max: 100,
				placeholder: '设置栅格间隔（px）',
			}
		},
		{
			key: 'layoutProps.justify',
			label: '水平排列',
			type: 'select',
			defaultValue: 'start',
			options: [
				{ label: '左对齐', value: 'start' },
				{ label: '右对齐', value: 'end' },
				{ label: '居中', value: 'center' },
				{ label: '两端对齐', value: 'space-between' },
				{ label: '分散对齐', value: 'space-around' },
				{ label: '平均分布', value: 'space-evenly' },
			],
		},
		{
			key: 'layoutProps.align',
			label: '垂直对齐',
			type: 'select',
			defaultValue: 'top',
			options: [
				{ label: '顶部', value: 'top' },
				{ label: '居中', value: 'middle' },
				{ label: '底部', value: 'bottom' },
			],
		},
	],
	grid: [
		// {
		// 	key: 'label',
		// 	label: '布局名称',
		// 	type: 'input',
		// 	defaultValue: '',
		// 	placeholder: '请输入布局名称',
		// },
		{
			key: 'layoutProps.justify',
			label: '水平排列',
			type: 'select',
			defaultValue: 'start',
			options: [
				{ label: '左对齐', value: 'start' },
				{ label: '右对齐', value: 'end' },
				{ label: '居中', value: 'center' },
				{ label: '两端对齐', value: 'space-between' },
				{ label: '分散对齐', value: 'space-around' },
				{ label: '平均分布', value: 'space-evenly' },
			],
		},
		{
			key: 'layoutProps.align',
			label: '垂直对齐',
			type: 'select',
			defaultValue: 'top',
			options: [
				{ label: '顶部', value: 'top' },
				{ label: '居中', value: 'middle' },
				{ label: '底部', value: 'bottom' },
			],
		},
		// {
		// 	key: 'layoutType',
		// 	label: '布局类型',
		// 	type: 'select',
		// 	defaultValue: 'grid',
		// 	options: [
		// 		{ label: '行布局', value: 'row' },
		// 		{ label: '栅格布局', value: 'grid' },
		// 	],
		// },
		{
			key: 'layoutProps.columns',
			label: '列数',
			type: 'number',
			defaultValue: 2,
			componentProps: {
				min: 1,
				max: 12,
				placeholder: '设置列数',
			}
		},
		{
			key: 'layoutProps.gutter',
			label: '间隔',
			type: 'number',
			defaultValue: 16,
			componentProps: {
				min: 0,
				max: 100,
				placeholder: '设置间隔（px）',
			}
		},
	],
	col: [
		// {
		// 	key: 'label',
		// 	label: '列名称',
		// 	type: 'input',
		// 	defaultValue: '',
		// 	placeholder: '请输入布局名称',
		// },
		{
			key: 'componentProps.span',
			label: '栅格占据的列数',
			type: 'number',
			defaultValue: 12,
			componentProps: {
				min: 1,
				max: 24,
			}
		},
		{
			key: 'componentProps.offset',
			label: '栅格左侧的间隔格数',
			type: 'number',
			componentProps: {
				min: 0,
				max: 24,
			}
		},
		{
			key: 'componentProps.push',
			label: '栅格向右移动格数',
			type: 'number',
			componentProps: {
				min: 0,
				max: 24,
			}
		},
		{
			key: 'componentProps.pull',
			label: '栅格向左移动格数',
			type: 'number',
			componentProps: {
				min: 0,
				max: 24,
			}
		},
		{
			key: 'componentProps.xs',
			label: '屏幕 <768px 时占据格数',
			type: 'number',
			componentProps: {
				min: 1,
				max: 24,
			}
		},
		{
			key: 'componentProps.sm',
			label: '屏幕 ≥768px 时占据格数',
			type: 'number',
			componentProps: {
				min: 1,
				max: 24,
			}
		},
		{
			key: 'componentProps.md',
			label: '屏幕 ≥992px 时占据格数',
			type: 'number',
			componentProps: {
				min: 1,
				max: 24,
			}
		},
		{
			key: 'componentProps.lg',
			label: '屏幕 ≥1200px 时占据格数',
			type: 'number',
			componentProps: {
				min: 1,
				max: 24,
			}
		},
		{
			key: 'componentProps.xl',
			label: '屏幕 ≥1920px 时占据格数',
			type: 'number',
			componentProps: {
				min: 1,
				max: 24,
			}
		},
		// {
		// 	key: 'layoutType',
		// 	label: '布局类型',
		// 	type: 'select',
		// 	defaultValue: 'col',
		// 	options: [
		// 		{ label: '行布局', value: 'row' },
		// 		{ label: '列布局', value: 'col' },
		// 		{ label: '栅格布局', value: 'grid' },
		// 	],
		// },
	],
}

/** Built-in field type configurations */
export const fieldTypeRegistry: FieldDefinition[] = [
	// ===== Basic Inputs =====
	{
		fieldId: `${generateId()}`,
		type: 'input',
		label: 'Input',
		labelCn: '输入框',
		icon: 'ep:edit',
		category: 'basic',
		fieldName: 'textField',
		valueType: 'string',
		validationRules: [],
		componentProps: {
			type: 'text',
			clearable: true,
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'textarea',
		label: 'Textarea',
		labelCn: '文本域',
		icon: 'ep:document',
		category: 'basic',
		fieldName: 'textareaField',
		validationRules: [],
		valueType: 'string',
		componentProps: {
			rows: 4,
			maxlength: 500,
			showWordLimit: true,
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'number',
		label: 'Number',
		labelCn: '步进器',
		icon: 'ep:plus',
		category: 'basic',
		fieldName: 'numberField',
		validationRules: [],
		valueType: 'number',
		componentProps: {
			controlsPosition: 'right',
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'password',
		label: 'Password',
		labelCn: '密码',
		icon: 'ep:lock',
		category: 'basic',
		fieldName: 'passwordField',
		validationRules: [],
		valueType: 'string',
		componentProps: {
			type: 'password',
			showPassword: true,
			clearable: true,
		},
	},

	// ===== Selectors =====
	{
		fieldId: `${generateId()}`,
		type: 'select',
		label: 'Dropdown',
		labelCn: '下拉选择',
		icon: 'ep:arrow-down',
		category: 'selector',
		validationRules: [],
		fieldName: 'selectField',
		valueType: 'string',
		componentProps: {
			clearable: true,
			filterable: true,
			options: [
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'radio',
		label: 'Radio',
		labelCn: '单选',
		icon: 'ep:select',
		category: 'selector',
		fieldName: 'radioField',
		validationRules: [],
		valueType: 'string',
		componentProps: {
			options: [
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'checkbox',
		label: 'Checkbox',
		labelCn: '复选',
		icon: 'ep:finished',
		category: 'selector',
		fieldName: 'checkboxField',
		validationRules: [],
		valueType: 'string',
		componentProps: {
			options: [
				{ label: 'Option 1', value: '1' },
				{ label: 'Option 2', value: '2' },
			],
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'switch',
		label: 'Switch',
		labelCn: '开关',
		icon: 'ep:open',
		category: 'selector',
		fieldName: 'switchField',
		validationRules: [],
		defaultValue: false,
		valueType: 'boolean',
		componentProps: {
			activeText: 'On',
			inactiveText: 'Off',
		},
	},

	// ===== Date & Time =====
	{
		fieldId: `${generateId()}`,
		type: 'datePicker',
		label: 'Date',
		labelCn: '日期',
		icon: 'ep:calendar',
		category: 'datetime',
		fieldName: 'dateField',
		validationRules: [],
		valueType: 'date',
		componentProps: {
			type: 'date',
			format: 'YYYY-MM-DD',
			valueFormat: 'YYYY-MM-DD',
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'timePicker',
		label: 'Time',
		labelCn: '时间',
		icon: 'ep:timer',
		category: 'datetime',
		fieldName: 'timeField',
		validationRules: [],
		valueType: 'time',
		componentProps: {
			format: 'HH:mm:ss',
			valueFormat: 'HH:mm:ss',
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'datePickerRange',
		label: 'DateRange',
		labelCn: '日期范围',
		icon: 'ep:calendar',
		category: 'datetime',
		fieldName: 'dateField',
		validationRules: [],
		valueType: 'date',
		componentProps: {
			type: 'daterange',
			format: 'YYYY-MM-DD',
			valueFormat: 'YYYY-MM-DD',
			startPlaceholder: '开始日期',
			endPlaceholder: '结束日期',
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'timePickerRange',
		label: 'TimeRange',
		labelCn: '时间范围',
		icon: 'ep:timer',
		category: 'datetime',
		fieldName: 'timeField',
		validationRules: [],
		valueType: 'time',
		componentProps: {
			isRange: true,
			format: 'HH:mm:ss',
			valueFormat: 'HH:mm:ss',
			startPlaceholder: '开始时间',
			endPlaceholder: '结束时间',
		},
	},

	// ===== Advanced =====
	{
		fieldId: `${generateId()}`,
		type: 'rate',
		label: 'Rate',
		labelCn: '评分',
		icon: 'ep:star-filled',
		category: 'advanced',
		fieldName: 'rateField',
		validationRules: [],
		valueType: 'number',
		componentProps: {
			type: 'rate',
			label: 'Rate',
			max: 5,
			allowHalf: false,
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'slider',
		label: 'Slider',
		labelCn: '滑块',
		icon: 'ep:connection',
		category: 'advanced',
		fieldName: 'sliderField',
		validationRules: [],
		valueType: 'number',
		componentProps: {
			min: 0,
			max: 100,
			step: 1,
		},
	},
	{
		fieldId: `${generateId()}`,
		type: 'colorPicker',
		label: 'Color',
		labelCn: '选择颜色',
		icon: 'ep:brush',
		category: 'advanced',
		fieldName: 'colorField',
		valueType: 'string',
		validationRules: [],
		componentProps: {
			showAlpha: false,
		},
	},

	// ===== 布局容器 Layout Containers =====
	// {
	// 	fieldId: `${generateId()}`,
	// 	type: 'layout',
	// 	label: '行布局',
	// 	icon: 'ep:grid',
	// 	category: 'layout',
	// 	componentProps: {},
	// 	validationRules: [],
	// 	fieldName: 'rowLayout',
	// 	layoutType: 'row',
	// 	children: [],
	// 	layoutProps: {
	// 		gutter: 0,
	// 		justify: 'start',
	// 		align: 'top',
	// 	},
	// 	colProps: {
	// 		span: 24,
	// 	}
	// },
	{
		fieldId: `${generateId()}`,
		type: 'layout',
		label: 'Grid',
		labelCn: '栅格布局',
		icon: 'ep:menu',
		category: 'layout',
		fieldName: 'gridLayout',
		layoutType: 'grid',
		componentProps: {},
		validationRules: [],
		children: [
			{
				fieldId: `${generateId()}`,
				type: 'layout',
				icon: 'ep:menu',
				label: 'Col',
				labelCn: '列布局',
				fieldName: 'gridLayout',
				category: 'layout',
				layoutType: 'col',
				validationRules: [],
				componentProps: {
					span: 12,
				},
				children: [],
			},
			{
				fieldId: `${generateId()}`,
				type: 'layout',
				icon: 'ep:menu',
				label: 'Col',
				labelCn: '列布局',
				fieldName: 'gridLayout',
				category: 'layout',
				layoutType: 'col',
				validationRules: [],
				componentProps: {
					span: 12,
				},
				layoutProps: {},
				children: [],
			},
		],
		layoutProps: {
			columns: 2,
			gutter: 0,
		},
		colProps: {
			span: 12,
		},
	},
]

/** Get field type config by type identifier */
export function getFieldTypeConfig(field?: FieldDefinition): PropertySchema[] | undefined {
	if (field === undefined) {
		return propertySchemas['form']
	}
	if (field.type === 'layout') {
		return propertySchemas[field.layoutType as string]
	} else {
		return propertySchemas[field.type]
	}
}

/** Get all field types by category */
export function getFieldTypesByCategory(category: string): FieldDefinition[] {
	return fieldTypeRegistry.filter((config) => config.category === category)
}

/** Register a custom field type */
export function registerFieldType(config: FieldDefinition): void {
	const existingIndex = fieldTypeRegistry.findIndex((c) => c.type === config.type)
	if (existingIndex !== -1) {
		fieldTypeRegistry[existingIndex] = config
	} else {
		fieldTypeRegistry.push(config)
	}
}

export function generateId(): string {
	return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Generate field name
export function generateFieldName(
	fields: FieldDefinition[],
	fieldType: string,
	count: number = 0,
): string {
	const existingFields = getFieldsByType(fields, fieldType)
	const typeCount = existingFields.length + count
	if (typeCount === 1) return fieldType
	return `${fieldType}${typeCount}`
}

export function getFieldsByType(
	fields: FieldDefinition[],
	fieldType: string,
	result: FieldDefinition[] = [],
): FieldDefinition[] {
	for (const field of fields) {
		// 命中类型
		if (field.type === fieldType) {
			result.push(field)
		}

		// 递归 layout.children
		if (field.children?.length) {
			getFieldsByType(field.children, fieldType, result)
		}
	}

	return result
}

// Get the appropriate component for rendering based on field type
export function getFieldComponent(field: FieldDefinition) {
	const componentMap: Record<string, any> = {
		input: ElInput,
		textarea: ElInput,
		number: ElInputNumber,
		password: ElInput,
		select: ElSelect,
		radio: ElRadioGroup,
		checkbox: ElCheckboxGroup,
		switch: ElSwitch,
		datePicker: ElDatePicker,
		datePickerRange: ElDatePicker,
		timePicker: ElTimePicker,
		timePickerRange: ElTimePicker,
		rate: ElRate,
		slider: ElSlider,
		colorPicker: ElColorPicker,
	}

	return componentMap[field.type] || ElInput
}

export function collectAllFieldNames(fields: FieldDefinition[]): OptionItem[] {
	const result: OptionItem[] = []

	const walk = (list: FieldDefinition[]) => {
		for (const field of list) {
			// 非 layout 才是真正的表单字段
			if (!field.layoutType) {
				result.push({
					label: field.label,
					value: field.fieldName,
				})
			}

			// 递归 children
			if (field.children?.length) {
				walk(field.children)
			}
		}
	}

	walk(fields)
	return result
}

export function collectAllFields(fields: FieldDefinition[]): FieldDefinition[] {
	const result: FieldDefinition[] = []

	const walk = (list: FieldDefinition[]) => {
		for (const field of list) {
			// 非 layout 才是真正的表单字段
			if (!field.layoutType) {
				result.push(field)
			}

			// 递归 children
			if (field.children?.length) {
				walk(field.children)
			}
		}
	}

	walk(fields)
	return result
}

/**
 * 根据类型获取格式化格式
 * @param value 日期选择器类型
 */
export const getFormatByValue = (value: string) => {
	return dateFormats.find((item) => item.value === value)?.format
}
