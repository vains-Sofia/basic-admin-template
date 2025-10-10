const modulesRoutes = import.meta.glob('/src/views/**/*.{vue,tsx}')

export function transformMenuToRoutes(menus: any[]): any[] {
	const modulesRoutesKeys = Object.keys(modulesRoutes)
	return menus.map((menu) => {
		const route: any = {
			path: menu.path,
			name: menu.name,
			meta: menu.meta,
		}

		// 动态 import 组件
		const index = menu?.component
			? modulesRoutesKeys.findIndex((ev) => ev.includes(menu?.component))
			: modulesRoutesKeys.findIndex((ev) => ev.includes(menu?.path))
		route.component = modulesRoutes[modulesRoutesKeys[index]]
		if (menu.children && menu.children.length > 1) {
			// 检查子节点是否有显示在侧边栏的
			const hasShowChildren = menu.children.filter((ev: any) => !ev?.meta?.hidden)
			if (hasShowChildren && hasShowChildren.length > 0) {
				route.component = null
			}
		}

		// 递归处理 children
		if (menu.children && menu.children.length > 0) {
			route.children = transformMenuToRoutes(menu.children)
		}

		return route
	})
}
