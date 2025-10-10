import {
	defineComponent,
	type PropType,
	ref,
	computed,
	nextTick,
	onMounted,
	onBeforeUnmount,
	watch,
	h,
	Fragment,
	type VNode,
} from 'vue'
import {
	ElTableV2,
	ElPagination,
	ElTooltip,
	ElButton,
	ElPopover,
	ElCheckboxGroup,
	ElCheckbox,
	ElAutoResizer,
	ElEmpty,
} from 'element-plus'
import { Icon } from '@iconify/vue'
import type { Column as ElTableColumn } from 'element-plus'

export interface TablePaginationV2 {
	currentPage: number
	pageSize: number
	total: number
	pageSizes?: number[]
}

export interface TableColumnV2<T = any> extends Omit<ElTableColumn<T>, 'width'> {
	width?: number
}

export default defineComponent({
	name: 'SmartVirtualizedTable',

	props: {
		/** 表格数据 */
		data: {
			type: Array as PropType<any[]>,
			default: () => [],
		},
		/** 可选的列配置 */
		columns: {
			type: Array as PropType<TableColumnV2[]>,
			default: () => [],
		},
		/** 是否显示分页器 */
		pagination: {
			type: Object as PropType<TablePaginationV2 | null>,
			default: null,
		},
		paginationLayout: {
			type: String,
			default: 'total, sizes, prev, pager, next, jumper',
		},
		adaptive: {
			type: Boolean,
			default: true,
		},
		extraGap: {
			type: Number,
			default: 50,
		},
		title: {
			type: String,
			default: '',
		},
		showRefresh: {
			type: Boolean,
			default: true,
		},
		showColumnController: {
			type: Boolean,
			default: true,
		},
		loading: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['update:pagination', 'size-change', 'current-change', 'sort-change', 'refresh'],

	setup(props, { emit, slots, attrs }) {
		// 分页器绑定
		const paginationConfig = computed(() => props.pagination ?? null)

		const handleSizeChange = (size: number) => {
			if (!paginationConfig.value) return
			const newPagination = { ...paginationConfig.value, pageSize: size, currentPage: 1 }
			emit('update:pagination', newPagination)
			emit('size-change', size)
		}

		const handleCurrentChange = (page: number) => {
			if (!paginationConfig.value) return
			const newPagination = { ...paginationConfig.value, currentPage: page }
			emit('update:pagination', newPagination)
			emit('current-change', page)
		}

		// 自适应高度
		const tableHeight = ref<number>(0)
		const tableRef = ref<HTMLElement | null>(null)
		const paginationRef = ref<HTMLElement | null>(null)
		const tableWidth = ref<number>(0)

		function getScrollContainer(el: HTMLElement | null): HTMLElement | Window {
			while (el) {
				const overflowY = window.getComputedStyle(el).overflowY
				if (overflowY === 'auto' || overflowY === 'scroll') return el
				el = el.parentElement
			}
			return window
		}

		const calcTableHeight = () => {
			if (!props.adaptive || !tableRef.value) return

			const container = getScrollContainer(tableRef.value)
			const containerHeight =
				container instanceof Window ? window.innerHeight : container.clientHeight

			const rect = tableRef.value.getBoundingClientRect()
			const containerRect =
				container instanceof Window ? { top: 0 } : container.getBoundingClientRect()
			const tableTop = rect.top - containerRect.top

			const paginationHeight = paginationRef.value?.offsetHeight || 0

			// 表格高度
			tableHeight.value = containerHeight - tableTop - paginationHeight - props.extraGap - 65
			if (tableHeight.value < 200) tableHeight.value = 200

			// 表格宽度
			tableWidth.value = (containerRect instanceof DOMRect ? containerRect.width : rect.width) - 20
		}

		let resizeObserver: ResizeObserver | null = null

		onMounted(() => {
			nextTick(() => {
				calcTableHeight()
				window.addEventListener('resize', calcTableHeight)
				resizeObserver = new ResizeObserver(() => calcTableHeight())
				watch(
					() => paginationRef.value,
					(el) => {
						resizeObserver?.disconnect()
						if (props.pagination && el instanceof HTMLElement) {
							resizeObserver?.observe(el)
						}
						calcTableHeight()
					},
					{ immediate: true },
				)
			})
		})

		onBeforeUnmount(() => {
			window.removeEventListener('resize', calcTableHeight)
			resizeObserver?.disconnect()
		})

		// 列控制
		const visibleColumns = ref(props.columns.map((c) => c.dataKey))

		// 构造 ElTableV2 的列
		const tableColumns = computed(() => {
			return props.columns
				.filter((c) => visibleColumns.value.includes(c.dataKey))
				.map((col) => {
					// 列宽默认200
					col.width = col.width || (tableWidth.value / props.columns.length)
					const slotName = col.slot || col.dataKey
					const headerSlotName = col.headerSlot || `${col.prop}-header`

					if (col.slot) {
						col.cellRenderer = ({ rowData, rowIndex }: any): VNode => {
							const value = rowData[col.dataKey]

							// 插槽优先
							if (slots[slotName]) {
								const slotResult = slots[slotName]({
									rowData,
									rowIndex,
									column: col,
								})

								// 保证返回单个 VNode
								if (Array.isArray(slotResult)) {
									return h(Fragment, null, slotResult)
								}
								return slotResult
							}

							// 有 formatter 的情况
							if (col.formatter) {
								return h('span', {}, col.formatter(rowData, col, value, rowIndex))
							}

							// 默认返回值
							return h('span', {}, value)
						}
					}

					if (col.headerSlot) {
						col.headerCellRenderer = () => {
							const slotResult = slots[headerSlotName]?.({ column: col })
							if (!slotResult) return null
							return Array.isArray(slotResult)
								? h(Fragment, null, slotResult)
								: slotResult
						}
					}

					return col
				})
		})

		const renderDefaultToolbar = () => (
			<div
				style="
          display:flex;justify-content:space-between;align-items:center;
          padding:0 11px 11px;border-bottom:1px solid var(--el-border-color-lighter);
        "
			>
				<div style="font-size:16px;font-weight:600;color:var(--el-text-color-primary);">
					{slots.title ? slots.title() : props.title}
				</div>
				<div style="display:flex;gap:0px;align-items:center;">
					{props.showRefresh && (
						<ElTooltip content="刷新" placement="top">
							<ElButton text onClick={() => emit('refresh')} disabled={props.loading}>
								<Icon icon="ep:refresh" />
							</ElButton>
						</ElTooltip>
					)}
					{props.showColumnController && (
						<ElTooltip content="列设置" placement="top" as-child>
							<div>
								<ElPopover trigger="click" placement="bottom-end">
									{{
										reference: () => (
											<ElButton text>
												<Icon icon="ep:menu" />
											</ElButton>
										),
										default: () => (
											<ElCheckboxGroup
												v-model={visibleColumns.value}
												style="padding-left:20px"
											>
												{props.columns.map((col) => (
													<ElCheckbox
														key={col.dataKey}
														label={col.dataKey}
													>
														{col.title}
													</ElCheckbox>
												))}
											</ElCheckboxGroup>
										),
									}}
								</ElPopover>
							</div>
						</ElTooltip>
					)}
				</div>
			</div>
		)

		return () => (
			<div
				style="background-color:var(--el-bg-color);padding:12px;box-sizing:border-box;"
				ref={tableRef}
			>
				{/* 工具栏 */}
				{slots.toolbar ? slots.toolbar() : renderDefaultToolbar()}

				<ElAutoResizer>
					{({ height, width }: { height: number; width: number }) => (
						<ElTableV2
							{...attrs}
							data={props.data}
							width={width}
							columns={tableColumns.value as any}
							height={props.adaptive ? tableHeight.value : height}
							v-loading={props.loading}
							v-slots={{
								empty: slots.empty
									? () => slots.empty?.()
									: () => <ElEmpty description="暂无数据" />,
							}}
							onSort-change={(sort: any) => emit('sort-change', sort)}
						/>
					)}
				</ElAutoResizer>

				{paginationConfig.value && (
					<div style="margin-top:12px;text-align:right">
						<ElPagination
							background
							ref={paginationRef}
							style="justify-content:flex-end;"
							layout={props.paginationLayout}
							currentPage={paginationConfig.value.currentPage}
							pageSize={paginationConfig.value.pageSize}
							total={paginationConfig.value.total}
							pageSizes={paginationConfig.value.pageSizes || [10, 20, 50, 100]}
							onUpdate:page-size={handleSizeChange}
							onUpdate:current-page={handleCurrentChange}
						/>
					</div>
				)}
			</div>
		)
	},
})
