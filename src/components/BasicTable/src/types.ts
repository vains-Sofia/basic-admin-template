import type { TableProps } from 'element-plus'

import type { BasicTableCommonProps, BasicTableRow } from '@/components/TableShared'

export interface BasicTableProps<
  T extends BasicTableRow = BasicTableRow,
> extends BasicTableCommonProps<T> {
  tableProps?: Partial<Omit<TableProps, 'data' | 'height' | 'rowKey'>>
}
