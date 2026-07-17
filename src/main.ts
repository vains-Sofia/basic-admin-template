import 'element-plus/dist/index.css'
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
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
setupRouterProgress(router)
setupRouterGuards(router, pinia)

app.use(pinia)
app.use(router)
app.directive('permission', permissionDirective)

window.addEventListener('auth:unauthorized', () => {
  void useUserStore(pinia)
    .signOut(false)
    .then(() => router.replace('/login'))
})

app.mount('#app')
