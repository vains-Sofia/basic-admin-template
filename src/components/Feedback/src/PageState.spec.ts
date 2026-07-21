// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import PageState from './PageState.vue'

describe('PageState', () => {
  it('renders an empty state', () => {
    const wrapper = mount(PageState, {
      props: { status: 'empty', emptyText: 'Nothing here' },
    })

    expect(wrapper.text()).toContain('Nothing here')
  })

  it('emits retry from the error state', async () => {
    const onRetry = vi.fn()
    const wrapper = mount(PageState, {
      props: { status: 'error', errorText: 'Failed', onRetry },
    })

    await wrapper.get('button').trigger('click')
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
