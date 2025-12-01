import {
	computed,
	defineComponent,
	nextTick,
	onBeforeUnmount,
	onMounted,
	type PropType,
	ref,
	type VNode,
	watch,
} from 'vue'
import type { TableColumnCtx } from 'element-plus'
import type { DefaultRow } from 'element-plus/es/components/table/src/table/defaults'
import { Icon } from '@iconify/vue'
import { AdaptiveTable } from '@/utils/Common.ts'

export interface TableColumn<T extends DefaultRow = any> {
	/** 列类型 */
	type?: 'selection' | 'index' | 'expand'
	/** 列字段 */
	dataKey?: string
	/** 表头文字 */
	title?: string
	/** 列宽度 */
	width?: string | number
	/** 最小宽度 */
	minWidth?: string | number
	/** 对齐方式 */
	align?: 'left' | 'center' | 'right'
	/** 固定列 */
	fixed?: boolean | 'left' | 'right'
	/** 是否显示 tooltip */
	showOverflowTooltip?: boolean
	/** 是否可排序 */
	sortable?: boolean | 'custom'
	/** 格式化显示 */
	formatter?: (row: T, column: TableColumnCtx<T>, cellValue: any, index: number) => string | VNode
	/** 单元格插槽名 */
	slot?: string
	/** 表头插槽名 */
	headerSlot?: string
}

export interface TablePagination {
	/** 当前页码 */
	currentPage: number
	/** 每页数量 */
	pageSize: number
	/** 总条数 */
	total: number
	/** 可选的每页大小 */
	pageSizes?: number[]
}

export default defineComponent({
	name: 'SmartTable',

	props: {
		/** 表格数据 */
		data: {
			type: Array as PropType<any[]>,
			default: () => [],
		},
		/** 可选的列配置 */
		columns: {
			type: Array as PropType<TableColumn[]>,
			default: () => [],
		},
		/** 是否显示分页器 */
		pagination: {
			type: Object as PropType<TablePagination | null>,
			default: null,
		},
		/** 分页器布局 */
		paginationLayout: {
			type: String,
			default: 'total, sizes, prev, pager, next, jumper',
		},
		/** 自适应高度 */
		adaptive: {
			type: Boolean,
			default: true,
		},
		/** 底部留白 */
		extraGap: {
			type: Number,
			default: 0,
		},
		/** 工具栏标题 */
		title: {
			type: String,
			default: '',
		},
		/** 显示刷新按钮 */
		showRefresh: {
			type: Boolean,
			default: true,
		},
		/** 显示列控制 */
		showColumnController: {
			type: Boolean,
			default: true,
		},
		/** 显示工具栏 */
		showToolbar: {
			type: Boolean,
			default: true,
		},
		/** 是否正在加载 */
		loading: {
			type: Boolean,
			default: false,
		},
	},

	emits: [
		'update:pagination',
		'size-change',
		'current-change',
		// 透传 Table 的原始事件
		'sort-change',
		'refresh',
	],

	setup(props, { attrs, slots, emit }) {
		/**
		 * 分页器的双向绑定
		 */
		const paginationConfig = computed(() => {
			return props.pagination ?? null
		})

		/**
		 * 分页器 -> 修改 pageSize
		 */
		const handleSizeChange = (size: number) => {
			if (!paginationConfig.value) return
			const newPagination = {
				...paginationConfig.value,
				pageSize: size,
				currentPage: 1, // 切换每页大小时重置页码
			}
			emit('update:pagination', newPagination)
			emit('size-change', size)
		}

		/**
		 * 分页器 -> 修改当前页
		 */
		const handleCurrentChange = (page: number) => {
			if (!paginationConfig.value) return
			const newPagination = {
				...paginationConfig.value,
				currentPage: page,
			}
			emit('update:pagination', newPagination)
			emit('current-change', page)
		}

		// =========== 表格自适应高度开始 ===========
		const tableRef = ref<HTMLElement | null>(null)
		const paginationRef = ref<HTMLElement | null>(null)
		const tableHeight = ref<number>(0)
		const toolbarRef = ref<HTMLElement | null>(null)

		const adaptiveTable = new AdaptiveTable(
			props,
			tableRef,
			paginationRef,
			tableHeight,
			undefined,
			toolbarRef,
		)

		let resizeObserver: ResizeObserver | null = null

		onMounted(async () => {
			await nextTick()

			adaptiveTable.calcTableHeight()

			// 监听窗口大小
			window.addEventListener('resize', () => adaptiveTable.calcTableHeight())

			// 监听分页器高度变化
			resizeObserver = new ResizeObserver(() => adaptiveTable.calcTableHeight())

			// 只有在分页器存在时才监听
			watch(
				() => paginationRef.value,
				(el) => {
					// 解绑旧的
					resizeObserver?.disconnect()
					// 绑定新的
					if (props.pagination && el instanceof HTMLElement) {
						resizeObserver?.observe(el)
					}
					// 重新计算高度
					adaptiveTable.calcTableHeight()
				},
				{ immediate: true },
			)
		})

		onBeforeUnmount(() => {
			window.removeEventListener('resize', () => adaptiveTable.calcTableHeight())
			resizeObserver?.disconnect()
		})

		// =========== 表格自适应高度结束 ===========

		// ===== 列展示控制 =====
		const visibleColumns = ref(props.columns.map((col) => col.dataKey))

		/**
		 * 渲染 columns 配置的列
		 */
		const renderColumns = () => {
			return props.columns
				.filter((col) => visibleColumns.value.includes(col.dataKey))
				.map((col) => {
					const slotName = col.slot || col.dataKey
					const headerSlotName = col.headerSlot || `${col.dataKey}-header`

					return (
						<ElTableColumn
							key={col.dataKey}
							prop={col.dataKey}
							type={col.type}
							label={col.title}
							width={col.width}
							minWidth={col.minWidth}
							align={col.align}
							fixed={col.fixed}
							showOverflowTooltip={col.showOverflowTooltip}
							sortable={col.sortable}
							formatter={col.formatter}
						>
							{{
								default:
									slotName && slots[slotName]
										? (scope: any) => slots[slotName]?.(scope)
										: undefined,
								header: slots[headerSlotName]
									? (scope: any) => slots[headerSlotName]?.(scope)
									: undefined,
							}}
						</ElTableColumn>
					)
				})
		}

		// ===== 渲染默认工具栏 =====
		const renderDefaultToolbar = () => {
			return (
				<div
					ref={toolbarRef}
					style="
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 0 11px 11px;
						border-bottom: 1px solid var(--el-border-color-lighter);
					  "
				>
					<div
						style="
						  font-size: 16px;
						  font-weight: 600;
						  color: var(--el-text-color-primary);
						"
					>
						{slots.title ? slots.title() : props.title}
					</div>
					<div style="display: flex; gap: 0px; align-items: center;">
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
													style="padding-left: 20px"
												>
													{props.columns.map((col) => (
														<ElCheckbox
															key={col.dataKey}
															value={col.dataKey}
															label={
																col.type === 'selection'
																	? '复选列'
																	: col.title
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
				style="background-color: var(--el-bg-color); padding: 12px; box-sizing: border-box;"
				ref={tableRef}
			>
				{/* 工具栏 */}
				{props.showToolbar
					? slots.toolbar
						? slots.toolbar()
						: renderDefaultToolbar()
					: null}

				<ElTable
					{...attrs}
					data={props.data}
					v-loading={props.loading}
					height={props.adaptive ? tableHeight.value : undefined}
					onSort-Change={(sort: any) => emit('sort-change', sort)}
					v-slots={{
						empty: slots.empty
							? () => slots.empty?.()
							: () => <ElEmpty description="暂无数据" />,
					}}
				>
					{renderColumns()}
					{/* 渲染用户直接写的 ElTableColumn 插槽 */}
					{slots.default?.()}
				</ElTable>

				{/* 分页器 */}
				{paginationConfig.value && (
					<div style="padding-top: 12px; text-align: right" ref={paginationRef}>
						<ElPagination
							background
							style="justify-content: flex-end;"
							layout={
								props.paginationLayout || 'total, sizes, prev, pager, next, jumper'
							}
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
