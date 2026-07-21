import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'nprogress/nprogress.css'
import './assets/styles/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import { permissionDirective } from './directives/permission'
import router from './router'
import { setupRouterGuards } from './router/guards'
import { setupRouterProgress } from './router/progress'
import { reportAppError } from './services/app-errors'
import { useLayoutStore } from './stores/layout'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
setupRouterProgress(router)
setupRouterGuards(router, pinia)

app.use(pinia)
app.use(router)
app.directive('permission', permissionDirective)
app.config.errorHandler = (error) => reportAppError(error, '页面运行出现异常')

useLayoutStore(pinia)

window.addEventListener('auth:unauthorized', () => {
  void useUserStore(pinia)
    .signOut(false)
    .then(() => router.replace('/login'))
})

window.addEventListener('error', (event) => {
  reportAppError(event.error ?? event.message, '页面运行出现异常')
})

window.addEventListener('unhandledrejection', (event) => {
  reportAppError(event.reason, '异步操作执行失败')
})

app.mount('#app')
