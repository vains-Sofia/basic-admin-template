import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import type { App } from 'vue'

export function install(app: App) {
	app.use(ElementPlus, {
		locale: zhCn,
	})
}
