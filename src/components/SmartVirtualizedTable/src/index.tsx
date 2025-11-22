import {
	computed,
	defineComponent,
	Fragment,
	type FunctionalComponent,
	h,
	nextTick,
	onBeforeUnmount,
	onMounted,
	type PropType,
	ref,
	unref,
	type VNode,
	watch,
} from 'vue'
import type { CheckboxValueType, Column as ElTableColumn } from 'element-plus'
import { Icon } from '@iconify/vue'
import { AdaptiveTable } from '@/utils/Common.ts'

export interface TablePaginationV2 {
	currentPage: number
	pageSize: number
	total: number
	pageSizes?: number[]
}

export interface TableColumnV2<T = any> extends Omit<ElTableColumn<T>, 'width'> {
	// 默认均分宽度
	width?: number
	// 是否为选择列
	selection?: boolean
	// 列自定义格式化
	formatter?: (rowData: any, col: TableColumnV2, value: any, rowIndex: any) => any
}

interface SelectionCellProps {
	value: boolean
	intermediate?: boolean
	onChange: (value: CheckboxValueType) => void
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
		/** 显示工具栏 */
		showToolbar: {
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

	emits: [
		'update:pagination',
		'size-change',
		'current-change',
		'sort-change',
		'refresh',
		'select',
		'select-all',
		'selection-change',
	],

	setup(props, { emit, slots, attrs }) {
		// 分页器绑定
		const paginationConfig = computed(() => props.pagination ?? null)

		/**
		 * 分页器 -> 修改 pageSize
		 */
		const handleSizeChange = (size: number) => {
			if (!paginationConfig.value) return
			const newPagination = { ...paginationConfig.value, pageSize: size, currentPage: 1 }
			emit('update:pagination', newPagination)
			emit('size-change', size)
		}

		/**
		 * 分页器 -> 修改当前页
		 */
		const handleCurrentChange = (page: number) => {
			if (!paginationConfig.value) return
			const newPagination = { ...paginationConfig.value, currentPage: page }
			emit('update:pagination', newPagination)
			emit('current-change', page)
		}

		// 自适应高度
		const tableHeight = ref<number>(0)
		const tableContainerRef = ref<HTMLElement | null>(null)
		const tableInstanceRef = ref()
		const paginationRef = ref<HTMLElement | null>(null)
		const tableWidth = ref<number>(0)

		let resizeObserver: ResizeObserver | null = null

		const adaptiveTable = new AdaptiveTable(
			props,
			tableContainerRef,
			paginationRef,
			tableHeight,
			tableWidth,
		)

		onMounted(async () => {
			await nextTick()

			adaptiveTable.calcTableHeight()
			resizeObserver = new ResizeObserver(() => adaptiveTable.calcTableHeight())
			window.addEventListener('resize', () => adaptiveTable.calcTableHeight())
			watch(
				() => paginationRef.value,
				(el) => {
					resizeObserver?.disconnect()
					if (props.pagination && el instanceof HTMLElement) {
						resizeObserver?.observe(el)
					}
					adaptiveTable.calcTableHeight()
				},
				{ immediate: true },
			)
		})

		onBeforeUnmount(() => {
			window.removeEventListener('resize', () => adaptiveTable.calcTableHeight())
			resizeObserver?.disconnect()
		})

		const SelectionCell: FunctionalComponent<SelectionCellProps> = ({
																			value,
																			intermediate = false,
																			onChange,
																		}) => {
			return (
				<ElCheckbox onChange={onChange} modelValue={value} indeterminate={intermediate} />
			)
		}

		// 列控制
		const visibleColumns = ref(props.columns.map((c) => c.dataKey))

		/**
		 * 自动计算未设置宽度单元格的宽度，计算时会排除不展示和固定宽带的列
		 * 计算方式：(表格宽度 - 设置宽度单元格宽度和) / (展示列的数量 - 展示列固定长度列数量)
		 */
		const getWidth = () => {
			// 固定宽度的列
			const fixedWidthCols = props.columns.filter(
				(c) => !c.autoWidth && visibleColumns.value.includes(c.dataKey),
			)
			// 固定宽度列的dataKey
			const fixedWidthColKeys = fixedWidthCols.map((c) => c.dataKey)
			// 固定列的宽度和
			const fixedWidth = fixedWidthCols.reduce((acc, c) => acc + (c.width ?? c.minWidth ?? 0), 0)

			// 自动计算宽度列时去除固定宽度列，仅计算剩余列的宽度
			return (
				(tableWidth.value - fixedWidth) /
				visibleColumns.value.filter((c) => !fixedWidthColKeys.includes(c)).length
			)
		}

		// 构造 ElTableV2 的列
		const tableColumns = computed(() => {
			return props.columns
				.filter((c) => visibleColumns.value.includes(c.dataKey))
				.map((col) => {
					if (col.autoWidth) {
						// 自动计算宽度列时去除固定宽度列，仅计算剩余列的宽度
						col.width = getWidth()
					} else {
						// 标志列的宽度是否为自动计算
						col.autoWidth = !col.width && !col.minWidth
						// 列宽默认200
						if (!col.minWidth) {
							col.width = col.width || getWidth()
						}
					}

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

							// 默认返回值
							return h('span', {}, value)
						}
					} else if (col.selection) {
						// 设置单元格展示复选框
						col.cellRenderer = ({ rowData }: any) => {
							const onChange = (value: CheckboxValueType) => {
								rowData.checked = value
								emit(
									'select',
									props.data.filter((d) => d.checked),
									rowData,
								)
								emit(
									'selection-change',
									props.data.filter((d) => d.checked),
								)
							}
							return <SelectionCell value={rowData.checked} onChange={onChange} />
						}
					}

					// 有 formatter 的情况
					if (col.formatter) {
						// 设置单元格展示复选框
						col.cellRenderer = ({ rowData, rowIndex }: any) => {
							const value = rowData[col.dataKey]
							return h('span', {}, col.formatter?.(rowData, col, value, rowIndex))
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
					} else if (col.selection) {
						// 设置表头为复选框，全选、半选由具体数据列决定
						col.headerCellRenderer = () => {
							const _data = unref(props.data)
							const onChange = (value: CheckboxValueType) => {
								props.data.forEach((row) => {
									row.checked = value
								})
								emit(
									'selection-change',
									props.data.filter((d) => d.checked),
								)
								emit(
									'select-all',
									props.data.filter((d) => d.checked),
								)
							}
							const allSelected =
								_data.length !== 0 && _data.every((row) => row.checked)
							const containsChecked = _data.some((row) => row.checked)

							return (
								<SelectionCell
									value={allSelected}
									intermediate={containsChecked && !allSelected}
									onChange={onChange}
								/>
							)
						}
					}

					return col
				})
		})

		const renderDefaultToolbar = () => {
			const onColumnChange = () => {
				adaptiveTable.calcTableHeight()
			}
			return (
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
						{/* 按钮插槽 */}
						{slots.toolbarSlot?.()}

						{/* 右侧默认工具 */}
						{props.showRefresh && (
							<ElTooltip content="刷新" placement="top">
								<ElButton
									text
									onClick={() => emit('refresh')}
									disabled={props.loading}
								>
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
													onChange={onColumnChange}
												>
													{props.columns.map((col) => (
														<ElCheckbox
															onChange={onColumnChange}
															key={col.dataKey}
															value={col.dataKey}
															label={
																col.selection ? '复选框' : col.title
															}
														/>
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
		}

		return () => (
			<div
				style="background-color:var(--el-bg-color); padding:12px; box-sizing:border-box;"
				ref={tableContainerRef}
			>
				{/* 工具栏 */}
				{props.showToolbar
					? slots.toolbar
						? slots.toolbar()
						: renderDefaultToolbar()
					: null}

				<ElAutoResizer>
					{({ height, width }: { height: number; width: number }) => (
						<ElTableV2
							{...attrs}
							ref={tableInstanceRef}
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
					<div style="margin-top:12px; text-align:right" ref={paginationRef}>
						<ElPagination
							background
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
