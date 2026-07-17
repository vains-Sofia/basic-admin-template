<script setup lang="ts" generic="T extends BasicTableRow = BasicTableRow">
import {
  ElEmpty,
  ElTable,
  ElTableColumn,
  type TableColumnCtx,
  type TableInstance,
} from 'element-plus'
import {
  computed,
  Fragment,
  h,
  nextTick,
  onMounted,
  ref,
  toRef,
  watch,
  type FunctionalComponent,
  type Ref,
  type VNodeChild,
} from 'vue'

import {
  getColumnKey,
  getRowKey,
  getValueByPath,
  TablePagination,
  TableToolbar,
  toCommonSortOrder,
  toElementSortOrder,
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

import type { BasicTableProps } from './types'

defineOptions({ name: 'BasicTable' })

const props = withDefaults(defineProps<BasicTableProps<T>>(), {
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
  'cell-click': [row: T, column: TableColumnCtx<T>, cell: HTMLTableCellElement, event: PointerEvent]
}>()

const tableRef = ref<TableInstance>()
const tableContainerRef = ref<HTMLElement | null>(null)
const tableAreaRef = ref<HTMLElement | null>(null)
const paginationRef = ref<HTMLElement | null>(null)
const selectedKeysState = ref<BasicTableKey[]>([...props.selectedKeys])
let syncingSelection = false

const { visibleColumnKeys, setVisibleColumnKeys, resetColumns } = useVisibleColumns<T>(
  toRef(props, 'columns') as Ref<BasicTableColumn<T>[]>,
)
const { adaptiveHeight, measure } = useTableDimensions({
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
const resolvedHeight = computed(
  () => props.height ?? (props.adaptive ? adaptiveHeight.value : undefined),
)

const CellContent: FunctionalComponent<{ content: VNodeChild }> = ({ content }) =>
  h(Fragment, null, [content])

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

function displayIndex(rowIndex: number): number {
  const offset = props.pagination
    ? (props.pagination.currentPage - 1) * props.pagination.pageSize
    : 0
  return offset + rowIndex + 1
}

function setColumns(keys: string[]): void {
  setVisibleColumnKeys(keys)
  emit('column-visibility-change', keys)
  void nextTick(measure)
}

function updatePagination(pagination: BasicTablePagination): void {
  emit('update:pagination', pagination)
}

function updateSelectedKeys(selection: T[]): void {
  const keys = selection.map((row) => getRowKey(row, props.rowKey))
  selectedKeysState.value = keys
  emit('update:selectedKeys', keys)
  emit('selection-change', selection)
}

function handleSelectionChange(selection: T[]): void {
  if (!syncingSelection) updateSelectedKeys(selection)
}

function handleSelect(selection: T[], row: T): void {
  emit('select', selection, row)
}

function handleSelectAll(selection: T[]): void {
  emit('select-all', selection)
}

async function syncNativeSelection(): Promise<void> {
  if (!tableRef.value || !props.columns.some((column) => column.type === 'selection')) return
  await nextTick()
  syncingSelection = true
  tableRef.value.clearSelection()
  const selected = new Set(selectedKeysState.value)
  props.data.forEach((row) => {
    if (selected.has(getRowKey(row, props.rowKey))) tableRef.value?.toggleRowSelection(row, true)
  })
  syncingSelection = false
}

function handleSortChange(value: {
  column: TableColumnCtx<T>
  prop: string | null
  order: string | null
}): void {
  const column = props.columns.find(
    (item) => String(item.dataKey ?? '') === String(value.prop ?? ''),
  )
  const sort: BasicTableSort<T> = {
    key: value.prop ?? '',
    order: toCommonSortOrder(value.order),
    column,
  }
  emit('update:sortBy', sort.order ? sort : null)
  emit('sort-change', sort)
}

function emitRowEvent(
  eventName: 'row-click' | 'row-dblclick',
  row: T,
  column: TableColumnCtx<T> | null,
  event: Event,
): void {
  const context = { row, rowIndex: props.data.indexOf(row), column, event }
  if (eventName === 'row-click') emit('row-click', context)
  else emit('row-dblclick', context)
}

function setSelectedKeys(keys: BasicTableKey[]): void {
  selectedKeysState.value = [...keys]
  emit('update:selectedKeys', [...keys])
  void syncNativeSelection()
}

watch(
  () => props.selectedKeys,
  (keys) => {
    selectedKeysState.value = [...keys]
    void syncNativeSelection()
  },
  { deep: true },
)

onMounted(() => {
  void syncNativeSelection()
  const sort = props.sortBy
  if (sort?.order) {
    const order = toElementSortOrder(sort.order)
    if (order) tableRef.value?.sort(String(sort.key), order)
  }
})

watch(
  () => props.data,
  () => void syncNativeSelection(),
  { deep: true },
)

watch(
  () => props.sortBy,
  (sort) => {
    if (!tableRef.value) return
    if (!sort?.order) tableRef.value.clearSort()
    else {
      const order = toElementSortOrder(sort.order)
      if (order) tableRef.value.sort(String(sort.key), order)
    }
  },
  { deep: true },
)

defineExpose({
  tableRef,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: T, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  getSelectionRows: () => tableRef.value?.getSelectionRows() as T[] | undefined,
  setSelectedKeys,
  setCurrentRow: (row?: T) => tableRef.value?.setCurrentRow(row),
  toggleRowExpansion: (row: T, expanded?: boolean) =>
    tableRef.value?.toggleRowExpansion(row, expanded),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: (columnKeys?: string[]) => tableRef.value?.clearFilter(columnKeys),
  doLayout: () => tableRef.value?.doLayout(),
  scrollTo: (options: number | ScrollToOptions, yCoord?: number) =>
    tableRef.value?.scrollTo(options, yCoord),
  setScrollTop: (top: number) => tableRef.value?.setScrollTop(top),
  setScrollLeft: (left: number) => tableRef.value?.setScrollLeft(left),
  resetColumns,
  measure,
})
</script>

<template>
  <section ref="tableContainerRef" class="basic-table">
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

    <div ref="tableAreaRef" class="basic-table__area">
      <ElTable
        ref="tableRef"
        v-bind="tableProps"
        v-loading="loading"
        :data="data"
        :height="resolvedHeight"
        :row-key="rowKey as string"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="(row, column, event) => emitRowEvent('row-click', row, column, event)"
        @row-dblclick="(row, column, event) => emitRowEvent('row-dblclick', row, column, event)"
        @cell-click="(...args) => emit('cell-click', ...args)"
      >
        <template
          v-for="(column, columnIndex) in visibleColumns"
          :key="getColumnKey(column, columnIndex)"
        >
          <ElTableColumn
            v-if="column.type === 'selection'"
            v-bind="column.nativeProps"
            type="selection"
            :width="column.width ?? 48"
            :fixed="column.fixed"
            :align="column.align ?? 'center'"
            :selectable="column.selectable"
            :reserve-selection="column.reserveSelection"
          />

          <ElTableColumn
            v-else
            v-bind="column.nativeProps"
            :type="column.type"
            :prop="column.dataKey as string"
            :label="column.title"
            :width="column.width"
            :min-width="column.minWidth"
            :align="column.align"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :show-overflow-tooltip="column.showOverflowTooltip"
          >
            <template #header>
              <slot
                v-if="$slots[getHeaderSlotName(column, columnIndex)]"
                :name="getHeaderSlotName(column, columnIndex)"
                v-bind="getHeaderContext(column, columnIndex)"
              />
              <template v-else>{{ column.title }}</template>
            </template>

            <template #default="scope">
              <slot
                v-if="$slots[getCellSlotName(column, columnIndex)]"
                :name="getCellSlotName(column, columnIndex)"
                v-bind="getCellContext(column, columnIndex, scope.row, scope.$index)"
              />
              <CellContent
                v-else-if="column.formatter"
                :content="
                  column.formatter(getCellContext(column, columnIndex, scope.row, scope.$index))
                "
              />
              <template v-else-if="column.type === 'index'">{{
                displayIndex(scope.$index)
              }}</template>
              <template v-else>{{ getValueByPath(scope.row, column.dataKey) }}</template>
            </template>
          </ElTableColumn>
        </template>

        <slot name="columns" />
        <template #empty>
          <slot name="empty"><ElEmpty :description="emptyText" /></slot>
        </template>
        <template v-if="$slots.append" #append><slot name="append" /></template>
      </ElTable>
    </div>

    <div v-if="pagination" ref="paginationRef">
      <TablePagination
        :model-value="pagination"
        :layout="paginationLayout"
        :background="paginationBackground"
        @update:model-value="updatePagination"
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
