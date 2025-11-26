// true 表示进行 eager 加载（同步导入）
const lastModules = import.meta.glob('@/router/modules/last/**/*.ts', { eager: true })
const staticModules = import.meta.glob('@/router/modules/static/**/*.ts', { eager: true })

// 静态路由
const staticRoutes: any[] = []

Object.values(staticModules).forEach((mod: any) => {
	// 每个文件都会 default 导出一个路由数组
	if (Array.isArray(mod.default)) {
		staticRoutes.push(...mod.default)
	}
})

// 最后的路由
const lastRouters: any[] = []

Object.values(lastModules).forEach((mod: any) => {
	// 每个文件都会 default 导出一个路由数组
	if (Array.isArray(mod.default)) {
		lastRouters.push(...mod.default)
	}
})

export { staticRoutes, lastRouters }
