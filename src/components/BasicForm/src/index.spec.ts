// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import BasicForm from '../index'

describe('BasicForm', () => {
  it('renders schema fields and updates the model', async () => {
    const model = reactive({ name: '', status: 'enabled' })
    const wrapper = mount(BasicForm, {
      props: {
        model,
        schema: [
          { field: 'name', label: 'Name', type: 'input' },
          {
            field: 'status',
            label: 'Status',
            type: 'select',
            options: [{ label: 'Enabled', value: 'enabled' }],
          },
        ],
      },
    })

    const input = wrapper.get('input')
    await input.setValue('Alice')
    expect(model.name).toBe('Alice')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.findAll('.el-form-item')).toHaveLength(2)
  })

  it('validates and exposes reset methods', async () => {
    const model = reactive({ name: '' })
    const wrapper = mount(BasicForm, {
      props: {
        model,
        schema: [
          {
            field: 'name',
            label: 'Name',
            type: 'input',
            rules: [{ required: true, message: 'Required', trigger: 'blur' }],
          },
        ],
      },
    })

    await flushPromises()
    expect(wrapper.findComponent({ name: 'ElFormItem' }).vm.$props.rules).toHaveLength(1)
    model.name = 'Alice'
    await flushPromises()
    const validAfterUpdate = await (
      wrapper.vm as unknown as { validate: () => Promise<boolean> }
    ).validate()
    expect(validAfterUpdate).toBe(true)

    ;(wrapper.vm as unknown as { resetFields: () => void }).resetFields()
    expect(model.name).toBe('')
  })

  it('allows a named slot to replace a field control', () => {
    const model = reactive({ name: '' })
    const wrapper = mount(BasicForm, {
      props: {
        model,
        schema: [{ field: 'name', label: 'Name', type: 'input' }],
      },
      slots: { name: '<span class="custom-control">custom</span>' },
    })

    expect(wrapper.find('.custom-control').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(false)
  })
})
