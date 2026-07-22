import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import * as authApi from '@/api/modules/auth'
import type { EmailLoginData, LoginData, UserProfile } from '@/api/types/AuthTypes'
import { clearAccessRoutes } from '@/router/access'
import {
  completeOAuth2Login,
  type OAuth2CallbackParams,
  type OAuth2LoginResult,
} from '@/services/oauth2'

import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tags-view'
import { isOAuth2Enabled } from '@/config/oauth2.ts'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const profile = ref<UserProfile | null>(null)
    const roles = computed(() => profile.value?.roles ?? [])
    const permissions = computed(() => profile.value?.permissions ?? [])

    async function signIn(data: LoginData): Promise<void> {
      const result = await authApi.login(data)
      if (!isOAuth2Enabled()) {
        token.value = result.token
        profile.value = result.profile
      }
    }

    async function signInByEmail(data: EmailLoginData): Promise<void> {
      const result = await authApi.loginByEmail(data)
      if (!isOAuth2Enabled()) {
        token.value = result.token
        profile.value = result.profile
      }
    }

    async function signInWithOAuth2(params: OAuth2CallbackParams): Promise<string> {
      const result: OAuth2LoginResult = await completeOAuth2Login(params)
      token.value = result.token
      profile.value = result.profile
      return result.returnPath
    }

    async function signOut(requestServer = true): Promise<void> {
      if (requestServer) await authApi.logout().catch(() => undefined)
      token.value = ''
      profile.value = null
      clearAccessRoutes()
      usePermissionStore().reset()
      useTagsViewStore().reset()
    }

    return {
      token,
      profile,
      roles,
      permissions,
      signIn,
      signInByEmail,
      signInWithOAuth2,
      signOut,
    }
  },
  { persist: { key: 'admin-user', pick: ['token', 'profile'] } },
)
