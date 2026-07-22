<script setup lang="ts">
import { CircleCheck, Loading, RefreshRight, Warning } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { DEFAULT_ROUTE } from '@/config/app'
import { isOAuth2Enabled } from '@/config/oauth2'
import { redirectToOAuth2 } from '@/services/oauth2'
import { useUserStore } from '@/stores/user'
import { getErrorMessage } from '@/utils/error'

defineOptions({ name: 'OAuth2CallbackView' })

type CallbackStatus = 'loading' | 'success' | 'error'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const status = ref<CallbackStatus>('loading')
const errorMessage = ref('')
const statusText = computed(() => {
  if (status.value === 'success') return '登录成功，正在进入系统...'
  if (status.value === 'error') return 'OAuth2 登录失败'
  return '正在验证授权信息...'
})

function firstQueryValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function removeSensitiveQuery(): void {
  const cleanUrl = new URL(window.location.href)
  cleanUrl.search = ''
  cleanUrl.hash = ''
  window.history.replaceState(window.history.state, document.title, cleanUrl.toString())
}

async function handleCallback(): Promise<void> {
  if (!isOAuth2Enabled()) {
    status.value = 'error'
    errorMessage.value = '当前环境未开启 OAuth2 登录'
    return
  }

  const params = {
    code: firstQueryValue(route.query.code),
    state: firstQueryValue(route.query.state),
    error: firstQueryValue(route.query.error),
    errorDescription: firstQueryValue(route.query.error_description),
  }
  removeSensitiveQuery()

  try {
    const returnPath = await userStore.signInWithOAuth2(params)
    status.value = 'success'
    await router.replace(returnPath)
  } catch (error) {
    status.value = 'error'
    errorMessage.value = getErrorMessage(error)
  }
}

async function retry(): Promise<void> {
  status.value = 'loading'
  errorMessage.value = ''
  try {
    await redirectToOAuth2(DEFAULT_ROUTE)
  } catch (error) {
    status.value = 'error'
    errorMessage.value = getErrorMessage(error)
  }
}

onMounted(handleCallback)
</script>

<template>
  <main class="oauth2-callback">
    <section class="callback-panel" role="status" aria-live="polite">
      <el-icon v-if="status === 'loading'" class="status-icon is-loading" :size="38">
        <Loading />
      </el-icon>
      <el-icon v-else-if="status === 'success'" class="status-icon is-success" :size="38">
        <CircleCheck />
      </el-icon>
      <el-icon v-else class="status-icon is-error" :size="38"><Warning /></el-icon>
      <h1>{{ statusText }}</h1>
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <el-button v-if="status === 'error' && isOAuth2Enabled()" type="primary" @click="retry">
        <el-icon><RefreshRight /></el-icon>
        重新登录
      </el-button>
    </section>
  </main>
</template>

<style scoped>
.oauth2-callback {
  display: grid;
  min-height: 100vh;
  padding: 24px;
  place-items: center;
  color: #1d293d;
  background: #f5f7fa;
}

.callback-panel {
  width: min(100%, 420px);
  padding: 40px 32px;
  border: 1px solid #dce3ed;
  border-radius: 8px;
  background: #fff;
  text-align: center;
}

.status-icon {
  margin-bottom: 14px;
  color: #2463eb;
}

.status-icon.is-loading {
  animation: rotating 1.5s linear infinite;
}

.status-icon.is-success {
  color: #17803d;
}

.status-icon.is-error {
  color: #d0302f;
}

h1 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0;
}

p {
  margin: 12px 0 22px;
  color: #68758a;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

@media (prefers-color-scheme: dark) {
  .oauth2-callback {
    color: #f0f3f8;
    background: #101419;
  }

  .callback-panel {
    border-color: #333e4d;
    background: #141920;
  }

  p {
    color: #9baabd;
  }
}

@keyframes rotating {
  to {
    transform: rotate(360deg);
  }
}
</style>
