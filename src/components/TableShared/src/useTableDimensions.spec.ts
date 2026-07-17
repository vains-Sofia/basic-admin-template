// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { useTableDimensions } from './useTableDimensions'

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => vi.stubGlobal('ResizeObserver', ResizeObserverMock))
afterEach(() => vi.restoreAllMocks())

describe('useTableDimensions', () => {
  it('subtracts pagination, container bottom inset, inherited layout gap and extra gap', async () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingBottom: '12px',
      borderBottomWidth: '1px',
      getPropertyValue: (property: string) =>
        property === '--basic-table-viewport-bottom-gap' ? '20px' : '',
    } as CSSStyleDeclaration)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 800,
      top: 300,
      width: 800,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.dataset.pagination === 'true' ? 44 : 0
    })
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900)

    const Harness = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement | null>(null)
        const tableAreaRef = ref<HTMLElement | null>(null)
        const paginationRef = ref<HTMLElement | null>(null)
        const { adaptiveHeight } = useTableDimensions({
          containerRef,
          tableAreaRef,
          paginationRef,
          minHeight: () => 240,
          extraGap: () => 5,
        })

        return () =>
          h('section', { ref: containerRef }, [
            h('div', { ref: tableAreaRef }),
            h('div', { ref: paginationRef, 'data-pagination': 'true' }),
            h('output', String(adaptiveHeight.value)),
          ])
      },
    })

    const wrapper = mount(Harness)
    await nextTick()
    await nextTick()

    expect(wrapper.get('output').text()).toBe('518')
  })
})
