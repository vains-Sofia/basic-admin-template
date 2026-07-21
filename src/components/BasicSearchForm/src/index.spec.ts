// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import BasicSearchForm from '../index'

describe('BasicSearchForm', () => {
  it('emits search and reset actions', async () => {
    const model = reactive({ keyword: '', status: '' })
    const onSearch = vi.fn()
    const onReset = vi.fn()
    const wrapper = mount(BasicSearchForm, {
      props: {
        model,
        schema: [
          { field: 'keyword', label: 'Keyword', type: 'input' },
          { field: 'status', label: 'Status', type: 'select', options: [] },
        ],
        searchOnReset: false,
        onSearch,
        onReset,
      },
    })

    await flushPromises()
    await wrapper.get('.basic-search-form__actions .el-button--primary').trigger('click')
    await flushPromises()
    expect(onSearch).toHaveBeenCalledOnce()
    await wrapper.findAll('.basic-search-form__actions .el-button')[1]?.trigger('click')
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('collapses fields after the configured threshold', async () => {
    const wrapper = mount(BasicSearchForm, {
      props: {
        model: reactive({ one: '', two: '', three: '', four: '' }),
        schema: [
          { field: 'one', label: 'One', type: 'input' },
          { field: 'two', label: 'Two', type: 'input' },
          { field: 'three', label: 'Three', type: 'input' },
          { field: 'four', label: 'Four', type: 'input' },
        ],
        collapseThreshold: 2,
      },
    })

    expect(wrapper.findAll('.el-form-item')).toHaveLength(2)
    await wrapper.get('.basic-search-form__actions .el-button.is-text').trigger('click')
    expect(wrapper.findAll('.el-form-item')).toHaveLength(4)
  })
})
