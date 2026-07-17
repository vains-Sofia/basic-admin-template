import { describe, expect, it } from 'vitest'

import { getColumnKey, getRowKey, getValueByPath, toCommonSortOrder } from './utils'

describe('table shared utilities', () => {
  it('reads nested values and creates stable keys', () => {
    const row = { id: 7, profile: { name: 'Alice' } }
    expect(getValueByPath(row, 'profile.name')).toBe('Alice')
    expect(getRowKey(row, 'id')).toBe(7)
    expect(getColumnKey({ dataKey: 'profile.name' }, 0)).toBe('profile.name')
  })

  it('normalizes native sort orders', () => {
    expect(toCommonSortOrder('ascending')).toBe('asc')
    expect(toCommonSortOrder('desc')).toBe('desc')
    expect(toCommonSortOrder(null)).toBeNull()
  })
})
