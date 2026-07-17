import { describe, expect, it } from 'vitest'

import { hasPermission, hasRole } from '../permission'

describe('permission helpers', () => {
  it('allows routes without role requirements', () => {
    expect(hasRole(undefined, [])).toBe(true)
  })

  it('matches any required role', () => {
    expect(hasRole(['admin', 'editor'], ['editor'])).toBe(true)
    expect(hasRole(['admin'], ['editor'])).toBe(false)
  })

  it('supports wildcard and complete permission matching', () => {
    expect(hasPermission(['user:create', 'user:edit'], ['*'])).toBe(true)
    expect(hasPermission(['user:create', 'user:edit'], ['user:create', 'user:edit'])).toBe(true)
    expect(hasPermission(['user:create', 'user:edit'], ['user:create'])).toBe(false)
  })
})
