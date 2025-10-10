import type { Placement } from 'element-plus'

// 导出组件相关类型
export interface TextTooltipProps {
	content: string
	placement?: Placement
	showAfter?: number
	maxWidth?: string | number
	lineClamp?: number | string
	disabled?: boolean
	tooltipClass?: string
	rawContent?: boolean
	effect?: 'dark' | 'light'
}

export interface TextTooltipEmits {
	'overflow-change': (isOverflow: boolean) => void
}
