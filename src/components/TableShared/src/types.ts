import type { VNodeChild } from 'vue'

export type BasicTableRow = object
export type BasicTableKey = string | number | symbol
export type BasicTableAlign = 'left' | 'center' | 'right'
export type BasicTableFixed = boolean | 'left' | 'right'
export type BasicTableColumnType = 'selection' | 'index' | 'expand'
export type BasicTableSortOrder = 'asc' | 'desc' | null

export interface BasicTableCellContext<T extends BasicTableRow = BasicTableRow> {
  row: T
  rowIndex: number
  column: BasicTableColumn<T>
  columnIndex: number
  value: unknown
}

export interface BasicTableHeaderContext<T extends BasicTableRow = BasicTableRow> {
  column: BasicTableColumn<T>
  columnIndex: number
}

export interface BasicTableColumn<T extends BasicTableRow = BasicTableRow> {
  key?: BasicTableKey
  dataKey?: keyof T | string
  title?: string
  type?: BasicTableColumnType
  width?: number
  minWidth?: number
  maxWidth?: number
  align?: BasicTableAlign
  fixed?: BasicTableFixed
  sortable?: boolean | 'custom'
  hidden?: boolean
  hideable?: boolean
  showOverflowTooltip?: boolean
  slot?: string
  headerSlot?: string
  formatter?: (context: BasicTableCellContext<T>) => VNodeChild
  selectable?: (row: T, rowIndex: number) => boolean
  reserveSelection?: boolean
  flexGrow?: number
  flexShrink?: number
  nativeProps?: Record<string, unknown>
}

export interface BasicTablePagination {
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
}

export interface BasicTableSort<T extends BasicTableRow = BasicTableRow> {
  key: BasicTableKey
  order: BasicTableSortOrder
  column?: BasicTableColumn<T>
}

export interface BasicTableRowEvent<T extends BasicTableRow = BasicTableRow> {
  row: T
  rowIndex: number
  event: Event
  column?: unknown
}

export type BasicTableRowKey<T extends BasicTableRow = BasicTableRow> =
  | Extract<keyof T, string>
  | string

export interface BasicTableCommonProps<T extends BasicTableRow = BasicTableRow> {
  data?: T[]
  columns?: BasicTableColumn<T>[]
  pagination?: BasicTablePagination | null
  paginationLayout?: string
  paginationBackground?: boolean
  adaptive?: boolean
  height?: number
  minHeight?: number
  extraGap?: number
  title?: string
  showToolbar?: boolean
  showRefresh?: boolean
  showColumnController?: boolean
  loading?: boolean
  rowKey?: BasicTableRowKey<T>
  selectedKeys?: BasicTableKey[]
  sortBy?: BasicTableSort<T> | null
  emptyText?: string
}

export interface TableToolbarColumn {
  key: string
  title: string
  hideable: boolean
}
