// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BasicDrawer, { useBasicDrawer } from '../index'

describe('BasicDrawer', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders a functionally configured drawer and handles async confirmation', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const onConfirm = vi.fn(async () => undefined)
    const controller = useBasicDrawer<{ id: number }>({
      drawerKey: 'test-drawer',
      title: '用户详情',
      size: '520px',
      bodyPadding: '12px 20px',
      showFooter: true,
      destroyOnClose: true,
      headerClass: 'custom-header',
      footerClass: 'custom-footer',
      content: '表单内容',
      onConfirm,
    })
    const wrapper = mount(BasicDrawer, { global: { plugins: [pinia] } })

    const drawer = wrapper.get('.el-drawer')
    expect(drawer.attributes('aria-label')).toBe('用户详情')
    expect(drawer.attributes('style')).toContain('width: 520px')
    expect(drawer.attributes('style')).toContain('--basic-drawer-body-padding: 12px 20px')
    expect(wrapper.find('.el-drawer__close-btn').exists()).toBe(true)
    expect(wrapper.get('.el-drawer__header').classes()).toEqual(
      expect.arrayContaining(['custom-header', 'basic-drawer__header']),
    )
    expect(wrapper.get('.el-drawer__footer').classes()).toEqual(
      expect.arrayContaining(['custom-footer', 'basic-drawer__footer']),
    )
    expect(wrapper.get('.el-overlay').attributes('style')).toContain('display: none')

    controller.open({ id: 1 })
    await nextTick()
    expect(wrapper.get('.el-drawer__body').classes()).toContain('basic-drawer__body')
    expect(wrapper.get('.el-overlay').attributes('style') ?? '').not.toContain('display: none')

    const buttons = wrapper.findAll('.el-drawer__footer .el-button')
    await buttons[1]?.trigger('click')
    await nextTick()

    expect(onConfirm).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({ drawerKey: 'test-drawer' }),
    )
    expect(controller.visible.value).toBe(false)
  })

  it('removes an empty header and renders string content', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const controller = useBasicDrawer({
      drawerKey: 'plain-content',
      content: '这是一段普通文本内容',
    })
    const wrapper = mount(BasicDrawer, { global: { plugins: [pinia] } })

    controller.open()
    await nextTick()

    expect(wrapper.find('.el-drawer__header').exists()).toBe(false)
    expect(wrapper.find('.el-drawer__close-btn').exists()).toBe(false)
    expect(wrapper.get('.el-drawer').attributes('style')).toContain(
      '--basic-drawer-body-padding: 0px',
    )
    expect(wrapper.text()).toContain('这是一段普通文本内容')
  })

  it('updates options without resetting existing callbacks', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const onConfirm = vi.fn()
    const controller = useBasicDrawer({
      drawerKey: 'runtime-options',
      title: '初始标题',
      onConfirm,
    })
    const wrapper = mount(BasicDrawer, { global: { plugins: [pinia] } })

    controller.setOptions({ title: '更新后的标题', size: '40%' })
    await nextTick()

    const drawer = wrapper.get('.el-drawer')
    expect(drawer.attributes('aria-label')).toBe('更新后的标题')
    expect(drawer.attributes('style')).toContain('width: 40%')
  })

  it('validates content and synchronizes its payload before confirming', async () => {
    const validate = vi.fn(async () => true)
    const getPayload = vi.fn(() => ({ id: 2 }))
    const onConfirm = vi.fn(async () => undefined)
    const Content = defineComponent({
      setup(_, { expose }) {
        expose({ validate, getPayload })
        return () => h('div', 'content')
      },
    })
    const pinia = createPinia()
    setActivePinia(pinia)
    const controller = useBasicDrawer({
      drawerKey: 'content-bridge',
      showFooter: true,
      content: Content,
      onConfirm,
    })
    const wrapper = mount(BasicDrawer, { global: { plugins: [pinia] } })

    controller.open({ id: 1 })
    await nextTick()
    await wrapper.get('.el-drawer__footer .el-button--primary').trigger('click')
    await nextTick()

    expect(validate).toHaveBeenCalledOnce()
    expect(getPayload).toHaveBeenCalledOnce()
    expect(onConfirm).toHaveBeenCalledWith({ id: 2 }, expect.anything())
  })
})
