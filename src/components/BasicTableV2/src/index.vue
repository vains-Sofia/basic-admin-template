<script setup lang="ts" generic="T extends BasicTableRow = BasicTableRow">
import {
  ElCheckbox,
  ElEmpty,
  ElTableV2,
  TableV2SortOrder,
  type CheckboxValueType,
  type Column,
  type ColumnSortParams,
  type RowEventHandlerParams,
  type RowEventHandlers,
  type TableV2Instance,
  type TableV2FixedDir,
} from 'element-plus'
import {
  computed,
  Fragment,
  h,
  nextTick,
  ref,
  toRef,
  useSlots,
  watch,
  type Ref,
  type VNode,
  type VNodeChild,
} from 'vue'

import {
  getColumnKey,
  getRowKey,
  getValueByPath,
  OverflowTooltip,
  TablePagination,
  TableToolbar,
  toCommonSortOrder,
  useTableDimensions,
  useVisibleColumns,
  type BasicTableCellContext,
  type BasicTableColumn,
  type BasicTableHeaderContext,
  type BasicTableKey,
  type BasicTablePagination,
  type BasicTableRow,
  type BasicTableRowEvent,
  type BasicTableSort,
} from '@/components/TableShared'

import type { BasicTableV2Props } from './types'

defineOptions({ name: 'BasicTableV2' })

const props = withDefaults(defineProps<BasicTableV2Props<T>>(), {
  data: () => [],
  columns: () => [],
  pagination: null,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationBackground: true,
  adaptive: true,
  minHeight: 240,
  extraGap: 0,
  title: '',
  showToolbar: true,
  showRefresh: true,
  showColumnController: true,
  loading: false,
  rowKey: 'id',
  selectedKeys: () => [],
  sortBy: null,
  emptyText: '暂无数据',
  tableProps: () => ({}),
})

const emit = defineEmits<{
  'update:pagination': [pagination: BasicTablePagination]
  'update:selectedKeys': [keys: BasicTableKey[]]
  'update:sortBy': [sort: BasicTableSort<T> | null]
  'page-size-change': [pageSize: number]
  'page-change': [page: number]
  'sort-change': [sort: BasicTableSort<T>]
  refresh: []
  select: [selection: T[], row: T]
  'select-all': [selection: T[]]
  'selection-change': [selection: T[]]
  'column-visibility-change': [keys: string[]]
  'row-click': [context: BasicTableRowEvent<T>]
  'row-dblclick': [context: BasicTableRowEvent<T>]
}>()

const slots = useSlots()
const tableRef = ref<TableV2Instance>()
const tableContainerRef = ref<HTMLElement | null>(null)
const tableAreaRef = ref<HTMLElement | null>(null)
const paginationRef = ref<HTMLElement | null>(null)
const selectedKeysState = ref<BasicTableKey[]>([...props.selectedKeys])

const { visibleColumnKeys, setVisibleColumnKeys, resetColumns } = useVisibleColumns<T>(
  toRef(props, 'columns') as Ref<BasicTableColumn<T>[]>,
)
const { width, adaptiveHeight, measure } = useTableDimensions({
  containerRef: tableContainerRef,
  tableAreaRef,
  paginationRef,
  minHeight: () => props.minHeight,
  extraGap: () => props.extraGap,
})

const visibleColumns = computed(() =>
  props.columns.filter((column, index) =>
    visibleColumnKeys.value.includes(getColumnKey(column, index)),
  ),
)
const toolbarColumns = computed(() =>
  props.columns.map((column, index) => ({
    key: getColumnKey(column, index),
    title: column.title || (column.type === 'selection' ? '选择列' : `列 ${index + 1}`),
    hideable: column.hideable !== false,
  })),
)
const resolvedHeight = computed(() =>
  Math.max(1, props.height ?? (props.adaptive ? adaptiveHeight.value : props.minHeight)),
)
const resolvedWidth = computed(() => Math.max(1, width.value))
const selectedKeySet = computed(() => new Set(selectedKeysState.value))
const selectedRows = computed(() =>
  props.data.filter((row) => selectedKeySet.value.has(getRowKey(row, props.rowKey))),
)

function getCellContext(
  column: BasicTableColumn<T>,
  columnIndex: number,
  row: T,
  rowIndex: number,
): BasicTableCellContext<T> {
  return {
    row,
    rowIndex,
    column,
    columnIndex,
    value: getValueByPath(row, column.dataKey),
  }
}

function getHeaderContext(
  column: BasicTableColumn<T>,
  columnIndex: number,
): BasicTableHeaderContext<T> {
  return { column, columnIndex }
}

function getCellSlotName(column: BasicTableColumn<T>, index: number): string {
  return column.slot ?? String(column.dataKey ?? getColumnKey(column, index))
}

function getHeaderSlotName(column: BasicTableColumn<T>, index: number): string {
  return column.headerSlot ?? `${getColumnKey(column, index)}-header`
}

function toVNode(content: VNodeChild): VNode {
  return h(Fragment, null, Array.isArray(content) ? content : [content])
}

function displayIndex(rowIndex: number): number {
  const offset = props.pagination
    ? (props.pagination.currentPage - 1) * props.pagination.pageSize
    : 0
  return offset + rowIndex + 1
}

function updateSelection(keys: BasicTableKey[], row?: T, selectAll = false): void {
  selectedKeysState.value = [...keys]
  const selection = props.data.filter((item) => keys.includes(getRowKey(item, props.rowKey)))
  emit('update:selectedKeys', [...keys])
  emit('selection-change', selection)
  if (row) emit('select', selection, row)
  if (selectAll) emit('select-all', selection)
}

function toggleRowSelection(row: T, rowIndex: number, checked: boolean): void {
  const selectionColumn = props.columns.find((column) => column.type === 'selection')
  if (selectionColumn?.selectable && !selectionColumn.selectable(row, rowIndex)) return
  const key = getRowKey(row, props.rowKey)
  const next = new Set(selectedKeysState.value)
  if (checked) next.add(key)
  else next.delete(key)
  updateSelection([...next], row)
}

function toggleAllSelection(checked: boolean): void {
  const selectionColumn = props.columns.find((column) => column.type === 'selection')
  const selectableRows = props.data.filter(
    (row, index) => !selectionColumn?.selectable || selectionColumn.selectable(row, index),
  )
  const next = new Set(selectedKeysState.value)
  selectableRows.forEach((row) => {
    const key = getRowKey(row, props.rowKey)
    if (checked) next.add(key)
    else next.delete(key)
  })
  updateSelection([...next], undefined, true)
}

function renderSelectionHeader(column: BasicTableColumn<T>): VNode {
  const selectableRows = props.data.filter(
    (row, index) => !column.selectable || column.selectable(row, index),
  )
  const selectedCount = selectableRows.filter((row) =>
    selectedKeySet.value.has(getRowKey(row, props.rowKey)),
  ).length
  return h(ElCheckbox, {
    modelValue: selectableRows.length > 0 && selectedCount === selectableRows.length,
    indeterminate: selectedCount > 0 && selectedCount < selectableRows.length,
    disabled: selectableRows.length === 0,
    onChange: (value: CheckboxValueType) => toggleAllSelection(Boolean(value)),
  })
}

function renderSelectionCell(column: BasicTableColumn<T>, row: T, rowIndex: number): VNode {
  const key = getRowKey(row, props.rowKey)
  return h(ElCheckbox, {
    modelValue: selectedKeySet.value.has(key),
    disabled: column.selectable ? !column.selectable(row, rowIndex) : false,
    onChange: (value: CheckboxValueType) => toggleRowSelection(row, rowIndex, Boolean(value)),
  })
}

function renderCell(
  column: BasicTableColumn<T>,
  columnIndex: number,
  params: {
    rowData: T
    rowIndex: number
  },
): VNode {
  if (column.type === 'selection') {
    return renderSelectionCell(column, params.rowData, params.rowIndex)
  }
  if (column.type === 'index') return h('span', String(displayIndex(params.rowIndex)))

  const context = getCellContext(column, columnIndex, params.rowData, params.rowIndex)
  const slot = slots[getCellSlotName(column, columnIndex)]
  const content: VNodeChild = slot
    ? slot(context)
    : column.formatter
      ? column.formatter(context)
      : String(context.value ?? '')
  const vnode = toVNode(content)

  return column.showOverflowTooltip
    ? h(OverflowTooltip, { content: context.value }, { default: () => vnode })
    : vnode
}

function renderHeader(column: BasicTableColumn<T>, columnIndex: number): VNode {
  if (column.type === 'selection') return renderSelectionHeader(column)
  const slot = slots[getHeaderSlotName(column, columnIndex)]
  return slot ? toVNode(slot(getHeaderContext(column, columnIndex))) : h('span', column.title ?? '')
}

const resolvedColumns = computed<Column<unknown>[]>(() =>
  visibleColumns.value.map((column, columnIndex) => {
    const key = column.key ?? column.dataKey ?? column.type ?? `column-${columnIndex}`
    const defaultWidth = column.type === 'selection' ? 48 : column.type === 'index' ? 64 : 150

    return {
      ...column.nativeProps,
      key,
      dataKey: column.dataKey ?? key,
      title: column.title,
      width: column.width ?? column.minWidth ?? defaultWidth,
      minWidth: column.minWidth,
      maxWidth: column.maxWidth,
      align: column.align,
      fixed: (column.fixed || undefined) as true | TableV2FixedDir | undefined,
      sortable: Boolean(column.sortable),
      flexGrow: column.flexGrow ?? (column.width ? 0 : 1),
      flexShrink: column.flexShrink ?? 1,
      cellRenderer: (params) =>
        renderCell(column, columnIndex, {
          rowData: params.rowData as T,
          rowIndex: params.rowIndex,
        }),
      headerCellRenderer: () => renderHeader(column, columnIndex),
    }
  }),
)

const resolvedTableProps = computed(() => {
  const nativeHandlers = props.tableProps.rowEventHandlers as RowEventHandlers | undefined
  const rowEventHandlers: RowEventHandlers = {
    ...nativeHandlers,
    onClick: (params: RowEventHandlerParams) => {
      nativeHandlers?.onClick?.(params)
      emit('row-click', {
        row: params.rowData as T,
        rowIndex: params.rowIndex,
        event: params.event,
      })
    },
    onDblclick: (params: RowEventHandlerParams) => {
      nativeHandlers?.onDblclick?.(params)
      emit('row-dblclick', {
        row: params.rowData as T,
        rowIndex: params.rowIndex,
        event: params.event,
      })
    },
  }
  return {
    ...props.tableProps,
    rowEventHandlers,
    ...(props.sortBy?.order
      ? {
          sortBy: {
            key: props.sortBy.key,
            order: props.sortBy.order === 'asc' ? TableV2SortOrder.ASC : TableV2SortOrder.DESC,
          },
        }
      : {}),
  }
})

function handleSortChange(params: ColumnSortParams<unknown>): void {
  const column = props.columns.find(
    (item, index) =>
      String(item.key ?? item.dataKey ?? '') === String(params.key ?? getColumnKey(item, index)),
  )
  const sort: BasicTableSort<T> = {
    key: params.key,
    order: toCommonSortOrder(params.order),
    column,
  }
  emit('update:sortBy', sort.order ? sort : null)
  emit('sort-change', sort)
}

function setColumns(keys: string[]): void {
  setVisibleColumnKeys(keys)
  emit('column-visibility-change', keys)
  void nextTick(measure)
}

function setSelectedKeys(keys: BasicTableKey[]): void {
  updateSelection(keys)
}

watch(
  () => props.selectedKeys,
  (keys) => (selectedKeysState.value = [...keys]),
  { deep: true },
)

defineExpose({
  tableRef,
  scrollTo: (position: { scrollLeft?: number; scrollTop?: number }) =>
    tableRef.value?.scrollTo(position),
  scrollToLeft: (left: number) => tableRef.value?.scrollToLeft(left),
  scrollToTop: (top: number) => tableRef.value?.scrollToTop(top),
  scrollToRow: (row: number, strategy?: 'auto' | 'center' | 'end' | 'smart' | 'start') =>
    tableRef.value?.scrollToRow(row, strategy),
  getSelectionRows: () => selectedRows.value,
  setSelectedKeys,
  clearSelection: () => updateSelection([]),
  resetColumns,
  measure,
})
</script>

<template>
  <section ref="tableContainerRef" class="basic-table basic-table-v2">
    <slot v-if="showToolbar && $slots.toolbar" name="toolbar" />
    <TableToolbar
      v-else-if="showToolbar"
      :title="title"
      :loading="loading"
      :show-refresh="showRefresh"
      :show-column-controller="showColumnController"
      :columns="toolbarColumns"
      :visible-column-keys="visibleColumnKeys"
      @refresh="emit('refresh')"
      @update:visible-column-keys="setColumns"
    >
      <template #title
        ><slot name="title">{{ title }}</slot></template
      >
      <template #actions><slot name="toolbar-actions" /></template>
    </TableToolbar>

    <div ref="tableAreaRef" v-loading="loading" class="basic-table__area">
      <ElTableV2
        ref="tableRef"
        v-bind="resolvedTableProps"
        :columns="resolvedColumns"
        :data="data"
        :width="resolvedWidth"
        :height="resolvedHeight"
        :row-key="rowKey"
        :on-column-sort="handleSortChange"
      >
        <template #empty
          ><slot name="empty"><ElEmpty :description="emptyText" /></slot
        ></template>
        <template v-if="$slots.row" #row="scope"><slot name="row" v-bind="scope" /></template>
        <template v-if="$slots['table-header']" #header="scope">
          <slot name="table-header" v-bind="scope" />
        </template>
        <template v-if="$slots['table-footer']" #footer>
          <slot name="table-footer" />
        </template>
        <template v-if="$slots.overlay" #overlay><slot name="overlay" /></template>
      </ElTableV2>
    </div>

    <div v-if="pagination" ref="paginationRef">
      <TablePagination
        :model-value="pagination"
        :layout="paginationLayout"
        :background="paginationBackground"
        @update:model-value="emit('update:pagination', $event)"
        @page-size-change="emit('page-size-change', $event)"
        @page-change="emit('page-change', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.basic-table {
  --basic-table-padding: 12px;
  --basic-table-border-width: 1px;

  width: 100%;
  min-width: 0;
  padding: var(--basic-table-padding);
  border: var(--basic-table-border-width) solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
}

.basic-table__area {
  width: 100%;
  min-width: 0;
}
</style>
