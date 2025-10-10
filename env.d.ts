/// <reference types="vite/client" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, any>
	export default component
}

interface ImportMetaEnv {
	/**
	 * 基础路径
	 */
	readonly VITE_BASE_PATH: string
	/**
	 * 后端接口地址
	 */
	readonly VITE_API_URL: string
	/**
	 * 路由模式 (hash | history)
	 */
	readonly VITE_ROUTER_MODE: 'hash' | 'history'
	/**
	 * Vue开发工具开关
	 */
	readonly VITE_VUE_DEVTOOLS: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
