// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BasicDialog, { useBasicDialog } from '../index'

describe('BasicDialog', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders configured props and handles async confirmation', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const onConfirm = vi.fn(async () => undefined)
    const controller = useBasicDialog<{ id: number }>({
      dialogKey: 'user-editor',
      title: '编辑用户',
      width: '520px',
      bodyPadding: 20,
      showFooter: true,
      destroyOnClose: true,
      content: '表单内容',
      headerClass: 'custom-header',
      footerClass: 'custom-footer',
      onConfirm,
    })
    controller.open({ id: 1 })
    const wrapper = mount(BasicDialog, { global: { plugins: [pinia] } })
    await nextTick()

    const dialog = wrapper.get('.el-dialog')
    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('编辑用户')
    expect(dialog.attributes('style')).toContain('width: 520px')
    expect(dialog.attributes('style')).toContain('--basic-dialog-body-padding: 20px')
    expect(wrapper.get('.el-dialog__header').classes()).toEqual(
      expect.arrayContaining(['custom-header', 'basic-dialog__header']),
    )
    expect(wrapper.get('.el-dialog__footer').classes()).toEqual(
      expect.arrayContaining(['custom-footer', 'basic-dialog__footer']),
    )

    expect(wrapper.text()).toContain('表单内容')
    expect(wrapper.get('.el-dialog__body').classes()).toContain('basic-dialog__body')

    const buttons = wrapper.findAll('.el-dialog__footer .el-button')
    await buttons[1]?.trigger('click')
    await nextTick()

    expect(onConfirm).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({ dialogKey: 'user-editor' }),
    )
    expect(controller.visible.value).toBe(false)
  })

  it('hides an empty header and supports string content', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const controller = useBasicDialog({
      dialogKey: 'plain-dialog',
      content: '这是一段普通文本内容',
    })
    const wrapper = mount(BasicDialog, { global: { plugins: [pinia] } })

    controller.open()
    await nextTick()

    expect(wrapper.get('.el-dialog__header').classes()).toContain('is-hidden')
    expect(wrapper.find('.el-dialog__headerbtn').exists()).toBe(false)
    expect(wrapper.text()).toContain('这是一段普通文本内容')
    expect(wrapper.get('.el-dialog').attributes('style')).toContain(
      '--basic-dialog-body-padding: 0px',
    )
  })

  it('updates options without resetting callbacks', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const onConfirm = vi.fn()
    const controller = useBasicDialog({
      dialogKey: 'runtime-options',
      title: '初始标题',
      onConfirm,
    })
    const wrapper = mount(BasicDialog, { global: { plugins: [pinia] } })

    controller.setOptions({ title: '更新后的标题', width: '40%' })
    controller.open()
    await nextTick()

    const dialog = wrapper.get('.el-dialog')
    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBe('更新后的标题')
    expect(dialog.attributes('style')).toContain('width: 40%')
  })
})
