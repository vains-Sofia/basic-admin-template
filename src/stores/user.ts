import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import * as authApi from '@/api/modules/auth'
import type { LoginData, UserProfile } from '@/api/types/AuthTypes'
import { clearAccessRoutes } from '@/router/access'

import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tags-view'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const profile = ref<UserProfile | null>(null)
    const roles = computed(() => profile.value?.roles ?? [])
    const permissions = computed(() => profile.value?.permissions ?? [])

    async function signIn(data: LoginData): Promise<void> {
      const result = await authApi.login(data)
      token.value = result.token
      profile.value = result.profile
    }

    async function signOut(requestServer = true): Promise<void> {
      if (requestServer) await authApi.logout().catch(() => undefined)
      token.value = ''
      profile.value = null
      clearAccessRoutes()
      usePermissionStore().reset()
      useTagsViewStore().reset()
    }

    return { token, profile, roles, permissions, signIn, signOut }
  },
  { persist: { key: 'admin-user', pick: ['token', 'profile'] } },
)
