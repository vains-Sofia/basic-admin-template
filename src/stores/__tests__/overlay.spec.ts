import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useBasicDrawer } from '@/components/BasicDrawer'
import { useBasicDialog } from '@/components/BasicDialog'
import { useOverlayStore } from '@/stores/overlay'

describe('overlay store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('isolates drawer instances and preserves payload until requested', () => {
    const editor = useBasicDrawer<{ id: number }>('user-editor')
    const detail = useBasicDrawer<{ id: number }>('user-detail')

    editor.open({ id: 1 })
    editor.setLoading(true)

    expect(editor.visible.value).toBe(true)
    expect(editor.loading.value).toBe(true)
    expect(editor.payload.value).toEqual({ id: 1 })
    expect(detail.visible.value).toBe(false)

    editor.close()
    expect(editor.visible.value).toBe(false)
    expect(editor.loading.value).toBe(false)
    expect(editor.payload.value).toEqual({ id: 1 })

    editor.close({ clearPayload: true })
    expect(editor.payload.value).toBeUndefined()
  })

  it('separates future dialog state from a drawer using the same key', () => {
    const store = useOverlayStore()
    const drawer = useBasicDrawer<{ source: string }>('editor')
    const dialog = useBasicDialog<{ source: string }>('editor')
    drawer.open({ source: 'drawer' })
    dialog.open({ source: 'dialog' })

    expect(store.getState('drawer', 'editor').payload).toEqual({ source: 'drawer' })
    expect(store.getState('dialog', 'editor').payload).toEqual({ source: 'dialog' })
  })
})
