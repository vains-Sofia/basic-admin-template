import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import { useTagsViewStore, type ViewTag } from '@/stores/tags-view'

describe('tags view store', () => {
  it('only caches views explicitly marked keepAlive', () => {
    setActivePinia(createPinia())
    const store = useTagsViewStore()
    store.tags = [
      { name: 'Dashboard', path: '/dashboard', title: 'Dashboard', affix: true, keepAlive: true },
      { name: 'Users', path: '/users', title: 'Users', affix: false, keepAlive: false },
    ] satisfies ViewTag[]

    expect(store.cachedViewNames).toEqual(['Dashboard'])
  })
})
