import { describe, expect, it, vi } from 'vitest'

import { useRequest } from './useRequest'

describe('useRequest', () => {
  it('tracks success and supports refresh with the last arguments', async () => {
    const executor = vi.fn(async (id: number) => ({ id }))
    const request = useRequest(executor)

    expect(request.status.value).toBe('idle')
    await request.execute(1)
    expect(request.status.value).toBe('success')
    expect(request.data.value).toEqual({ id: 1 })

    await request.refresh()
    expect(executor).toHaveBeenLastCalledWith(1)
  })

  it('keeps the latest result when requests finish out of order', async () => {
    let resolveFirst: (value: string) => void = () => undefined
    const first = new Promise<string>((resolve) => {
      resolveFirst = resolve
    })
    const executor = vi.fn((value: string) => (value === 'first' ? first : Promise.resolve(value)))
    const request = useRequest(executor)

    const firstRun = request.execute('first')
    await request.execute('second')
    resolveFirst('first')
    await firstRun

    expect(request.data.value).toBe('second')
    expect(request.status.value).toBe('success')
  })

  it('exposes normalized errors and resets state', async () => {
    const request = useRequest(async () => {
      throw new Error('boom')
    })

    await expect(request.execute()).rejects.toThrow('boom')
    expect(request.status.value).toBe('error')
    expect(request.error.value?.message).toBe('boom')

    request.reset()
    expect(request.status.value).toBe('idle')
    expect(request.error.value).toBeUndefined()
  })
})
