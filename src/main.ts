import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'

// 进度条
import "nprogress/nprogress.css"
import NProgress from 'nprogress'

// 进度条配置
NProgress.configure({
	// 动画方式
	easing: "ease",
	// 递增进度条的速度
	speed: 500,
	// 是否显示加载ico
	showSpinner: false,
	// 自动递增间隔
	trickleSpeed: 200,
	// 初始化时的最小百分比
	minimum: 0.3
});

// element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 引入动画库 animate.css
import 'animate.css'

import './assets/base.css'
// Iconify 图标组件注册
import { Icon } from '@iconify/vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Pinia持久化插件
const pinia = createPinia()
const installPersistedStatePlugin = createPersistedStatePlugin()
pinia.use(installPersistedStatePlugin)

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
	locale: zhCn,
})

// 注册图标
app.component('Icon', Icon)

app.mount('#app')
