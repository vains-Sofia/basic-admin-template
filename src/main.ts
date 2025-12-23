import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'
import hljs from 'highlight.js'

/* 引入动画库 animate.css */
import 'animate.css'
import NProgress from 'nprogress'

// 引入复制指令
import vCopy from './directives/copy'
// 引入防抖指令
import { vDebounce } from '@/directives/debounce'

// 进度条配置
NProgress.configure({
	// 动画方式
	easing: 'ease',
	// 递增进度条的速度
	speed: 500,
	// 是否显示加载ico
	showSpinner: false,
	// 自动递增间隔
	trickleSpeed: 200,
	// 初始化时的最小百分比
	minimum: 0.3,
})

import './assets/base.css'
// Iconify 图标组件注册
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'
import { autoImport } from '@/AutoImport.ts'

const app = createApp(App)

// Pinia持久化插件
const pinia = createPinia()
const installPersistedStatePlugin = createPersistedStatePlugin()
pinia.use(installPersistedStatePlugin)

app.use(pinia)
app.use(router)
// app.use(ElementPlus, {
// 	locale: zhCn,
// })

// element-plus
// install(app)
autoImport(app)

// 注册图标
app.component('Icon', Icon)

// 注册指令
app.directive('copy', vCopy)
app.directive('debounce', vDebounce)
// 代码高亮
app.directive('highlight', {
	mounted(el: HTMLElement) {
		const blocks = el.querySelectorAll('pre code')
		blocks.forEach((block) => hljs.highlightElement(block as HTMLElement))
	},
	updated(el: HTMLElement) {
		const blocks = el.querySelectorAll('pre code')
		blocks.forEach((block) => hljs.highlightElement(block as HTMLElement))
	}
})

app.mount('#app')

// Vue 挂载完成后，淡出并移除 Loading
const loader = document.getElementById('app-loading')
if (loader) {
	loader.classList.add('fade-out')
	// 等淡出动画结束再移除
	loader.addEventListener('transitionend', () => loader.remove(), { once: true })
}
