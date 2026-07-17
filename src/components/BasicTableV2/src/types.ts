import type { TableV2Props } from 'element-plus'

import type { BasicTableCommonProps, BasicTableRow } from '@/components/TableShared'

export interface BasicTableV2Props<
  T extends BasicTableRow = BasicTableRow,
> extends BasicTableCommonProps<T> {
  tableProps?: Partial<
    Omit<TableV2Props, 'data' | 'columns' | 'width' | 'height' | 'rowKey' | 'onColumnSort'>
  >
}
