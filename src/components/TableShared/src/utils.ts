import type {
  BasicTableColumn,
  BasicTableKey,
  BasicTableRow,
  BasicTableRowKey,
  BasicTableSortOrder,
} from './types'

export function getValueByPath(source: unknown, path: PropertyKey | undefined): unknown {
  if (source == null || path == null) return undefined
  if (typeof path !== 'string' || !path.includes('.')) {
    return (source as Record<PropertyKey, unknown>)[path]
  }

  return path.split('.').reduce<unknown>((value, key) => {
    if (value == null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, source)
}

export function getColumnKey<T extends BasicTableRow>(
  column: BasicTableColumn<T>,
  index: number,
): string {
  return String(column.key ?? column.dataKey ?? column.type ?? `column-${index}`)
}

export function getRowKey<T extends BasicTableRow>(
  row: T,
  rowKey: BasicTableRowKey<T>,
): BasicTableKey {
  const value = getValueByPath(row, rowKey)
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'symbol') {
    return value
  }
  return String(value ?? '')
}

export function toCommonSortOrder(order: unknown): BasicTableSortOrder {
  if (order === 'ascending' || order === 'asc') return 'asc'
  if (order === 'descending' || order === 'desc') return 'desc'
  return null
}

export function toElementSortOrder(order: BasicTableSortOrder): 'ascending' | 'descending' | null {
  if (order === 'asc') return 'ascending'
  if (order === 'desc') return 'descending'
  return null
}
