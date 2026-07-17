import type { Router } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const nprogress = vi.hoisted(() => ({
  configure: vi.fn(),
  start: vi.fn(),
  done: vi.fn(),
}))

vi.mock('nprogress', () => ({ default: nprogress }))

import { setupRouterProgress } from '../progress'

function createRouterMock() {
  return {
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    onError: vi.fn(),
  }
}

describe('setupRouterProgress', () => {
  beforeEach(() => vi.clearAllMocks())

  it('connects progress to successful and failed navigations', () => {
    const routerMock = createRouterMock()
    setupRouterProgress(routerMock as unknown as Router)

    const beforeHook = routerMock.beforeEach.mock.calls[0]?.[0] as () => void
    const afterHook = routerMock.afterEach.mock.calls[0]?.[0] as () => void
    const errorHook = routerMock.onError.mock.calls[0]?.[0] as () => void

    beforeHook()
    afterHook()
    errorHook()

    expect(nprogress.configure).toHaveBeenCalledWith({
      minimum: 0.08,
      showSpinner: false,
      trickleSpeed: 200,
    })
    expect(nprogress.start).toHaveBeenCalledOnce()
    expect(nprogress.done).toHaveBeenCalledTimes(2)
  })

  it('installs hooks only once for the same router', () => {
    const routerMock = createRouterMock()
    const router = routerMock as unknown as Router

    setupRouterProgress(router)
    setupRouterProgress(router)

    expect(routerMock.beforeEach).toHaveBeenCalledOnce()
    expect(routerMock.afterEach).toHaveBeenCalledOnce()
    expect(routerMock.onError).toHaveBeenCalledOnce()
  })
})
