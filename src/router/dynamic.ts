import type { RouteRecordRaw } from 'vue-router'

export interface DynamicRouteContext {
  roles: string[]
  permissions: string[]
}

export type DynamicRouteLoader = (context: DynamicRouteContext) => Promise<RouteRecordRaw[]>

let loader: DynamicRouteLoader = async () => []

// 后端菜单接入时，在应用启动前注入转换后的 RouteRecordRaw 数组即可。
export function setDynamicRouteLoader(dynamicLoader: DynamicRouteLoader): void {
  loader = dynamicLoader
}

export function loadDynamicRoutes(context: DynamicRouteContext): Promise<RouteRecordRaw[]> {
  return loader(context)
}
