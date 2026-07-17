// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import BasicTable from '../index'

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

describe('BasicTable', () => {
  it('renders unified columns and emits controlled selection keys', async () => {
    const onSelectedKeys = vi.fn()
    const rows = [
      { id: 1, name: 'Alice', profile: { city: 'Shanghai' } },
      { id: 2, name: 'Bob', profile: { city: 'Beijing' } },
    ]
    const wrapper = mount(BasicTable, {
      props: {
        data: rows,
        columns: [
          { key: 'selection', type: 'selection', width: 48 },
          { dataKey: 'name', title: '姓名' },
          { dataKey: 'profile.city', title: '城市' },
        ],
        rowKey: 'id',
        adaptive: false,
        height: 240,
        showToolbar: false,
        'onUpdate:selectedKeys': onSelectedKeys,
      },
    })

    await nextTick()
    await flushPromises()
    await nextTick()
    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Shanghai')

    ;(wrapper.vm as unknown as { setSelectedKeys: (keys: number[]) => void }).setSelectedKeys([2])
    await nextTick()

    expect(onSelectedKeys).toHaveBeenLastCalledWith([2])
  })

  it('uses the same pagination update contract as V2', async () => {
    const onPagination = vi.fn()
    const wrapper = mount(BasicTable, {
      props: {
        data: [],
        columns: [{ dataKey: 'name', title: '姓名' }],
        adaptive: false,
        pagination: { currentPage: 1, pageSize: 10, total: 30 },
        'onUpdate:pagination': onPagination,
      },
    })
    const pagination = wrapper.findComponent({ name: 'TablePagination' })
    pagination.vm.$emit('update:modelValue', { currentPage: 2, pageSize: 10, total: 30 })
    await nextTick()

    expect(onPagination).toHaveBeenLastCalledWith({ currentPage: 2, pageSize: 10, total: 30 })
  })
})
