// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import BasicTableV2 from '../index'

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 800,
  })
})

describe('BasicTableV2', () => {
  it('uses the unified column model without mutating row selection state', async () => {
    const onSelectedKeys = vi.fn()
    const rows = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const wrapper = mount(BasicTableV2, {
      props: {
        data: rows,
        columns: [
          { key: 'selection', type: 'selection', width: 48 },
          { dataKey: 'name', title: '姓名', minWidth: 120 },
        ],
        rowKey: 'id',
        adaptive: false,
        height: 240,
        showToolbar: false,
        'onUpdate:selectedKeys': onSelectedKeys,
      },
    })

    await nextTick()
    await nextTick()
    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('Alice')

    ;(wrapper.vm as unknown as { setSelectedKeys: (keys: number[]) => void }).setSelectedKeys([1])
    await nextTick()

    expect(onSelectedKeys).toHaveBeenLastCalledWith([1])
    expect(rows.some((row) => 'checked' in row)).toBe(false)
  })

  it('renders formatter output through the unified context', async () => {
    const wrapper = mount(BasicTableV2, {
      props: {
        data: [{ id: 1, score: 8 }],
        columns: [
          {
            dataKey: 'score',
            title: '得分',
            formatter: ({ value }: { value: unknown }) => `分数：${String(value)}`,
          },
        ],
        adaptive: false,
        height: 240,
        showToolbar: false,
      },
    })

    await nextTick()
    await nextTick()
    expect(wrapper.text()).toContain('分数：8')
  })
})
