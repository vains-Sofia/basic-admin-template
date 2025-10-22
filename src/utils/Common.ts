import { type Ref } from 'vue'

/**
 * 根据传入列名和顺序对对象数组排序
 * @param arr 原始数组
 * @param key 排序列名
 * @param order 排序顺序 'asc' | 'desc'
 * @returns 排序后的新数组
 */
export function sortByKey<T extends Record<string, unknown>>(
	arr: T[],
	key: keyof T,
	order: 'asc' | 'desc' = 'asc',
): T[] {
	return [...arr].sort((a, b) => {
		const valA = a[key] as unknown
		const valB = b[key] as unknown

		// 处理 undefined/null
		if (valA == null && valB == null) return 0
		if (valA == null) return order === 'asc' ? 1 : -1
		if (valB == null) return order === 'asc' ? -1 : 1

		// 类型检查
		const isNumA = typeof valA === 'number'
		const isNumB = typeof valB === 'number'

		if (isNumA && isNumB) {
			return order === 'asc' ? valA - valB : valB - valA
		}

		// 统一转为字符串比较
		return order === 'asc'
			? // eslint-disable-next-line @typescript-eslint/no-base-to-string
				String(valA).localeCompare(String(valB))
			: // eslint-disable-next-line @typescript-eslint/no-base-to-string
				String(valB).localeCompare(String(valA))
	})
}

export class AdaptiveTable {
	props: { adaptive: boolean; extraGap: number; pagination: any, showToolbar: boolean }
	tableContainerRef: Ref<HTMLElement | null>
	paginationRef: Ref<HTMLElement | null>
	tableHeight: Ref<number>
	tableWidth?: Ref<number>

	constructor(
		props: { adaptive: boolean; extraGap: number; pagination: any, showToolbar: boolean },
		tableContainerRef: Ref<HTMLElement | null>,
		paginationRef: Ref<HTMLElement | null>,
		tableHeight: Ref<number>,
		tableWidth?: Ref<number>,
	) {
		this.props = props
		this.tableWidth = tableWidth
		this.tableHeight = tableHeight
		this.paginationRef = paginationRef
		this.tableContainerRef = tableContainerRef
	}

	calcTableHeight() {
		if (!this.props.adaptive || !this.tableContainerRef.value) return

		const container = getScrollContainer(this.tableContainerRef.value)
		const containerHeight =
			container instanceof Window ? window.innerHeight : container.clientHeight

		const rect = this.tableContainerRef.value.getBoundingClientRect()
		const containerRect =
			container instanceof Window ? { top: 0 } : container.getBoundingClientRect()
		const tableTop = rect.top - containerRect.top

		const paginationHeight = this.paginationRef.value?.offsetHeight || 0

		// 表格高度
		this.tableHeight.value =
			containerHeight - tableTop - paginationHeight - this.props.extraGap - (this.props.showToolbar === undefined || this.props.showToolbar ? 65 : 18)
		if (this.tableHeight.value < 200) this.tableHeight.value = 200

		// 表格宽度
		if (this.tableWidth) {
			this.tableWidth.value =
				(containerRect instanceof DOMRect ? containerRect.width : rect.width) - 20
		}
	}
}

function getScrollContainer(el: HTMLElement | null): HTMLElement | Window {
	while (el) {
		const overflowY = window.getComputedStyle(el).overflowY
		if (overflowY === 'auto' || overflowY === 'scroll') return el
		el = el.parentElement
	}
	return window
}
