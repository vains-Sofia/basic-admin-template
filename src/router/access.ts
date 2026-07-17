import type { Router, RouteRecordRaw } from 'vue-router'

let removeRoutes: Array<() => void> = []

export function installAccessRoutes(router: Router, routes: RouteRecordRaw[]): void {
  clearAccessRoutes()
  removeRoutes = routes.map((route) => router.addRoute('Root', route))
}

export function clearAccessRoutes(): void {
  removeRoutes.forEach((removeRoute) => removeRoute())
  removeRoutes = []
}
