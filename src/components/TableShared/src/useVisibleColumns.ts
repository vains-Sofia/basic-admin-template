import { ref, watch, type Ref } from 'vue'

import type { BasicTableColumn, BasicTableRow } from './types'
import { getColumnKey } from './utils'

export function useVisibleColumns<T extends BasicTableRow>(columns: Ref<BasicTableColumn<T>[]>) {
  const visibleColumnKeys = ref<string[]>([])
  const knownColumnKeys = new Set<string>()

  watch(
    columns,
    (nextColumns) => {
      const nextKeys = nextColumns.map(getColumnKey)
      visibleColumnKeys.value = visibleColumnKeys.value.filter((key) => nextKeys.includes(key))

      nextColumns.forEach((column, index) => {
        const key = getColumnKey(column, index)
        if (!knownColumnKeys.has(key) && !column.hidden) visibleColumnKeys.value.push(key)
        knownColumnKeys.add(key)
      })
    },
    { immediate: true, deep: true },
  )

  function setVisibleColumnKeys(keys: string[]): void {
    visibleColumnKeys.value = [...keys]
  }

  function resetColumns(): void {
    visibleColumnKeys.value = columns.value
      .map((column, index) => ({ column, key: getColumnKey(column, index) }))
      .filter(({ column }) => !column.hidden)
      .map(({ key }) => key)
  }

  return { visibleColumnKeys, setVisibleColumnKeys, resetColumns }
}
