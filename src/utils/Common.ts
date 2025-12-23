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
	toolbarRef?: Ref<HTMLElement | null>

	constructor(
		props: { adaptive: boolean; extraGap: number; pagination: any, showToolbar: boolean },
		tableContainerRef: Ref<HTMLElement | null>,
		paginationRef: Ref<HTMLElement | null>,
		tableHeight: Ref<number>,
		tableWidth?: Ref<number>,
		toolbarRef?: Ref<HTMLElement | null>
	) {
		this.props = props
		this.tableWidth = tableWidth
		this.toolbarRef = toolbarRef
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

		const toolbarHeight = this.toolbarRef?.value?.offsetHeight || 0
		const paginationHeight = this.paginationRef.value?.offsetHeight || 0

		// 表格高度
		this.tableHeight.value =
			containerHeight - tableTop
			// 分页组件高度
			- paginationHeight
			// 工具栏高度
			- this.props.extraGap - (this.props.showToolbar ? toolbarHeight : 0)
			// 表格外层容器padding高度
		    - 24

		if (this.tableHeight.value < 200) this.tableHeight.value = 200

		// 表格宽度
		if (this.tableWidth) {
			this.tableWidth.value =
				(containerRect instanceof DOMRect ? containerRect.width : rect.width) - 20
		}
	}
}

export function getScrollContainer(el: HTMLElement | null): HTMLElement | Window {
	while (el) {
		const overflowY = window.getComputedStyle(el).overflowY
		if (overflowY === 'auto' || overflowY === 'scroll') return el
		el = el.parentElement
	}
	return window
}

export interface TreeNode {
	id: number | string
	parentId: number | string | null
	[key: string]: any
}

export function listToTree<T extends TreeNode>(list: T[]): T[] {
	const result: T[] = []
	const map = new Map<string | number, T>()

	// 预创建所有节点的 children
	list.forEach(item => {
		map.set(item.id, { ...item, children: [] })
	})

	list.forEach(item => {
		const node = map.get(item.id)!
		if (item.parentId == null || !map.has(item.parentId)) {
			// 顶级节点
			result.push(node)
		} else {
			// 放入父节点中
			const parent = map.get(item.parentId)!
			parent.children.push(node)
		}
	})

	return result
}

export function generateUUID() {
	let dt = new Date().getTime();

	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (dt + Math.random() * 16) % 16 | 0
		dt = Math.floor(dt / 16)
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
	})
}

/**
 * 验证并生成合法的 BPMN id（QName）
 * @param id 待验证的字符串
 * @param prefix 可选前缀，如果 id 不合法则使用前缀开头
 * @returns 合法的 BPMN id
 */
export function makeValidBpmnId(id: string, prefix = 'Process'): string {
	if (!id) {
		throw new Error('id 不能为空');
	}

	// 替换所有非法字符为下划线
	let validId = id.replace(/[^A-Za-z0-9_\-\.]/g, '_');

	// 确保首字符是字母或下划线
	if (!/^[A-Za-z_]/.test(validId)) {
		validId = `${prefix}_${validId}`;
	}

	// 避免连续下划线过多
	validId = validId.replace(/_+/g, '_');

	return validId;
}

/**
 * 验证是否符合 BPMN ProcessKey（NCName / 可选 QName）格式
 * @param key 待校验的 process key 字符串
 * @param options 是否允许带前缀的 QName 格式 (prefix:local)。默认 false。
 * @returns boolean 是否通过校验
 */
export function isValidBpmnProcessKey(key: string, options?: { allowQName?: boolean }): boolean {
	if (key.length === 0) return false;

	// NCName: starts with letter or underscore, then letters/digits/dot/underscore/hyphen
	const ncName = /^[A-Za-z_][A-Za-z0-9._-]*$/;

	if (options?.allowQName) {
		// QName: prefix:local where both prefix and local are NCName, only one colon allowed
		const qName = /^[A-Za-z_][A-Za-z0-9._-]*:[A-Za-z_][A-Za-z0-9._-]*$/;
		return ncName.test(key) || qName.test(key);
	}

	// 默认只允许 NCName（不允许冒号）
	return ncName.test(key);
}

export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		return obj.map(item => deepClone(item)) as unknown as T;
	}

	const clonedObj: any = {};
	for (const key in obj) {
		const value = (obj as any)[key];
		clonedObj[key] = typeof value === 'function' ? value : deepClone(value);
	}
	return clonedObj;
}

export const getContainerHeight = (containerRef: Ref) => {
	if (!containerRef.value) return
	const container = getScrollContainer(containerRef.value)
	const containerHeight =
		container instanceof Window ? window.innerHeight : container.clientHeight

	const rect = containerRef.value.getBoundingClientRect()
	const containerRect =
		container instanceof Window ? { top: 0 } : container.getBoundingClientRect()
	const containerTop = rect.top - containerRect.top

	return containerHeight - containerTop
}
