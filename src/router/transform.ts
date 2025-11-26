import { defineAsyncComponent, h } from 'vue'

const error = () => import('@/views/error/404.vue')
const layout = () => import('@/components/Layout/index.vue')
const IFrame = () => import('@/components/Layout/frame.vue')
import UniversalRouteWrapper from '@/components/UniversalRouteWrapper'
const modulesRoutes = import.meta.glob('/src/views/**/*.{vue,tsx}')

/**
 * 将菜单数据与实际组件关联
 * @param menus 菜单
 * @param isTopLevel 顶级菜单
 */
export function transformMenuToRoutes(menus: any[], isTopLevel = true): any[] {
	const modulesRoutesKeys = Object.keys(modulesRoutes)
	return menus.map((menu) => {
		const route: any = {
			path: menu.path,
			name: menu.name,
			meta: menu.meta,
		}

		// iframe 路由优先处理（关键）
		if (route.meta?.frameSrc) {
			route.component = layout
			route.children = [
				{
					path: '',
					name: `${route.name}-iframe`,
					meta: route.meta,
					component: IFrame,
				},
			]
			return route
		}

		// 动态 import 组件
		const index = menu?.component
			? modulesRoutesKeys.findIndex((ev) => ev.includes(menu?.component))
			: modulesRoutesKeys.findIndex((ev) => ev.includes(menu?.path))
		const comp = modulesRoutes[modulesRoutesKeys[index]]
		route.component = comp
		if (menu.children && menu.children.length > 0) {
			if (isTopLevel) {
				// 有子节点时，左侧添加Layout布局
				route.component = layout
			} else {
				route.component = withWrapper(comp, route.path)
			}
		} else {
			if (route.meta?.frameSrc) {
				route.component = IFrame
			} else if (!route.component) {
				// 无子节点时没有找到vue组件则改为404页面
				route.component = error
			}
		}

		// 递归处理 children
		if (menu.children && menu.children.length > 0) {
			route.children = transformMenuToRoutes(menu.children, false)
		}

		return route
	})
}

// 包装组件
function withWrapper(originalComponent: any, path: string) {
	const comp =
		typeof originalComponent === 'function'
			? defineAsyncComponent(() => originalComponent())
			: originalComponent

	// 返回一个渲染 UniversalRouteWrapper 的组件实例（不可返回 Promise）
	return {
		name: 'UniversalRouteWrapperInstance',
		setup() {
			return () => h(UniversalRouteWrapper, { path, component: comp })
		},
	}
}

/**
 * 将绝对路径转为相对路径
 * @param routes 路由
 * @param parentPath 父路径
 */
export function normalizeRoutes(routes: any[], parentPath = ''): any[] {
	return routes.map((route) => {
		const path = route.path || ''

		// 根路径保留 / 开头
		const isRoot = !parentPath

		// 去掉开头的 /，得到相对路径
		let relativePath = path.replace(/^\/+/, '')

		// 避免重复拼接 parentPath
		if (
			parentPath &&
			parentPath !== '/' &&
			relativePath.startsWith(parentPath.replace(/^\/+/, ''))
		) {
			relativePath = relativePath.slice(parentPath.length).replace(/^\/+/, '')
		}

		// fullPath 用于递归拼接子路由
		const fullPath = parentPath ? `${parentPath}/${relativePath}`.replace(/\/+/g, '/') : path

		return {
			...route,
			// 顶层路由保持绝对路径，子路由用相对路径
			path: isRoot ? fullPath : relativePath,
			children: route.children ? normalizeRoutes(route.children, fullPath) : undefined,
		}
	})
}
