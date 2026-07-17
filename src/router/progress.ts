import NProgress from 'nprogress'
import type { Router } from 'vue-router'

const installedRouters = new WeakSet<Router>()

export function setupRouterProgress(router: Router): void {
  if (installedRouters.has(router)) return
  installedRouters.add(router)

  NProgress.configure({
    minimum: 0.08,
    showSpinner: false,
    trickleSpeed: 200,
  })

  router.beforeEach(() => {
    NProgress.start()
  })
  router.afterEach(() => {
    NProgress.done()
  })
  router.onError(() => {
    NProgress.done()
  })
}
