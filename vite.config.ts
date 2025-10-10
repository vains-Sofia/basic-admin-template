import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// 加载环境变量
	const env = loadEnv(mode, process.cwd())
	const devToolsEnabled = env.VITE_VUE_DEVTOOLS === 'true'

	return {
		plugins: [
			vue(),
			vueJsx(),
			tailwindcss(),
			// 根据环境变量决定是否启用 Vue 开发工具
			devToolsEnabled ? vueDevTools() : null,
		].filter(Boolean),

		// 设置基础路径
		base: env.VITE_BASE_PATH || '/',

		server: {
			host: '0.0.0.0',
		},

		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		}
	}
})
