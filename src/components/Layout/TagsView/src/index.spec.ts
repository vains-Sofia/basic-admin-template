// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, describe, expect, it } from 'vitest'

import { useTagsViewStore } from '@/stores/tags-view'

import TagsView from '../index'

const view = { template: '<div />' }

afterEach(() => {
  document.body.innerHTML = ''
})

describe('TagsView', () => {
  it('keeps one context menu open and closes tags on the right', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/dashboard', name: 'DashboardView', component: view },
        { path: '/users', name: 'SystemUsers', component: view },
        { path: '/table', name: 'TableExamples', component: view },
      ],
    })
    await router.push('/table')
    await router.isReady()

    const tagsStore = useTagsViewStore()
    tagsStore.tags = [
      { name: 'DashboardView', path: '/dashboard', title: '工作台', affix: true },
      { name: 'SystemUsers', path: '/users', title: '用户管理', affix: false },
      { name: 'TableExamples', path: '/table', title: '表格示例', affix: false },
    ]

    const wrapper = mount(TagsView, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })
    const tags = wrapper.findAll('.tags-view__item')
    const dashboardTag = tags[0]
    const userTag = tags[1]
    await dashboardTag?.trigger('contextmenu')
    await new Promise((resolve) => setTimeout(resolve, 200))
    await userTag?.trigger('contextmenu')
    await new Promise((resolve) => setTimeout(resolve, 200))

    const visiblePoppers = document.body.querySelectorAll<HTMLElement>(
      '.el-popper[aria-hidden="false"]',
    )
    expect(visiblePoppers).toHaveLength(1)
    expect(
      visiblePoppers[0]?.querySelector('.el-dropdown-menu')?.getAttribute('aria-labelledby'),
    ).toBe(userTag?.attributes('id'))

    const closeRight = Array.from(
      visiblePoppers[0]?.querySelectorAll<HTMLElement>('.el-dropdown-menu__item') ?? [],
    ).find((item) => item.textContent?.includes('关闭右侧'))
    closeRight?.click()
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(closeRight).toBeDefined()
    expect(tagsStore.tags.map((tag) => tag.name)).toEqual(['DashboardView', 'SystemUsers'])
    expect(router.currentRoute.value.name).toBe('SystemUsers')

    wrapper.unmount()
  })
})
