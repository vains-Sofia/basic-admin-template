import { ElLoading } from 'element-plus'
import type { App } from 'vue'

export function autoImport(app: App) {
	app.directive('loading',ElLoading.directive)
}
