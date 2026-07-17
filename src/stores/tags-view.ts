import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface ViewTag {
  name: string
  path: string
  title: string
  affix: boolean
}

export const useTagsViewStore = defineStore('tags-view', () => {
  const tags = ref<ViewTag[]>([])
  const cachedViewNames = computed(() => tags.value.map((tag) => tag.name))

  function add(route: RouteLocationNormalizedLoaded): void {
    if (!route.name || !route.meta.title || route.meta.hidden) return
    const name = String(route.name)
    const existing = tags.value.find((tag) => tag.name === name)
    const nextTag = {
      name,
      path: route.fullPath,
      title: route.meta.title,
      affix: Boolean(route.meta.affix),
    }
    if (existing) Object.assign(existing, nextTag)
    else tags.value.push(nextTag)
  }

  function remove(name: string): void {
    tags.value = tags.value.filter((tag) => tag.name !== name || tag.affix)
  }

  function reset(): void {
    tags.value = tags.value.filter((tag) => tag.affix)
  }

  return { tags, cachedViewNames, add, remove, reset }
})
